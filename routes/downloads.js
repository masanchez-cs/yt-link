const Router = require('@koa/router');
const Joi = require('joi');
const { success, fail } = require('../src/system/response');
const { resolveDownloadBase } = require('../src/system/paths');
const jobs = require('../src/system/jobs');
const { runYtDlp, runYtDlpGetDirectUrl } = require('../src/modules/ytDownload');
const { formatSpawnError } = require('../src/system/resolveYtDlp');

const router = new Router();

function isSupportedDownloadUrl(value) {
  try {
    const u = new URL(value);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    const allowedYoutubeHosts = new Set([
      'youtu.be',
      'm.youtube.com',
      'music.youtube.com',
    ]);
    const isYoutubeHost =
      allowedYoutubeHosts.has(host) ||
      host === 'youtube.com' ||
      host.endsWith('.youtube.com');
    if (isYoutubeHost) {
      return true;
    }
    const isGoogleVideoDirect =
      host.endsWith('.googlevideo.com') && u.pathname === '/videoplayback';
    return isGoogleVideoDirect;
  } catch {
    return false;
  }
}

const bodySchema = Joi.object({
  url: Joi.string()
    .uri()
    .required()
    .custom((value, helpers) => {
      if (!isSupportedDownloadUrl(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
  formatPreset: Joi.string()
    .valid('mp4_best', 'mp3', 'best')
    .default('best'),
  playlistMode: Joi.string().valid('auto', 'video_only').default('auto'),
});

const directLinkSchema = Joi.object({
  url: Joi.string()
    .uri()
    .required()
    .custom((value, helpers) => {
      if (!isSupportedDownloadUrl(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
  formatPreset: Joi.string()
    .valid('mp4_best', 'mp3', 'best')
    .default('best'),
  playlistMode: Joi.string().valid('auto', 'video_only').default('video_only'),
});

router.post('/downloads', async (ctx) => {
  const { error, value } = bodySchema.validate(ctx.request.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.') || 'body',
      code: 'VALIDATION',
      message: d.message,
    }));
    return fail(
      ctx,
      400,
      'VALIDATION_ERROR',
      'Revisa la URL y las opciones enviadas.',
      details,
    );
  }

  let outDir;
  try {
    outDir = resolveDownloadBase();
  } catch (e) {
    return fail(
      ctx,
      500,
      'INTERNAL_SERVER_ERROR',
      'No fue posible preparar la carpeta de descargas.',
      [],
    );
  }

  const job = jobs.createJob({
    url: value.url,
    formatPreset: value.formatPreset,
    playlistMode: value.playlistMode,
  });

  success(ctx, {
    job_id: job.id,
    download_dir: outDir,
  });

  setImmediate(() => {
    const startedAt = Date.now();
    (async () => {
      job.status = 'running';
      jobs.pushEvent(job, { type: 'status', status: 'started' });

      const result = await runYtDlp(job, {
        url: value.url,
        formatPreset: value.formatPreset,
        playlistMode: value.playlistMode,
        outDir,
        onEvent: (evt) => jobs.pushEvent(job, evt),
      });

      if (result.spawnError) {
        jobs.pushEvent(job, {
          type: 'error',
          error_code: 'EXTERNAL_SERVICE_ERROR',
          message: formatSpawnError(
            result.spawnError,
            result.spawnAttempt || '',
          ),
          duration_ms: Date.now() - startedAt,
        });
        jobs.completeJob(job, 'error');
        jobs.deleteJobLater(job.id);
        return;
      }

      if (!result.ok) {
        jobs.pushEvent(job, {
          type: 'error',
          error_code: 'EXTERNAL_SERVICE_ERROR',
          message:
            'La descarga falló. Revisa el enlace, el formato elegido y la salida en el registro.',
          exit_code: result.code,
          duration_ms: Date.now() - startedAt,
        });
        jobs.completeJob(job, 'error');
        jobs.deleteJobLater(job.id);
        return;
      }

      jobs.pushEvent(job, {
        type: 'done',
        percent: result.lastPercent,
        merged_path: result.mergedPath || null,
        download_dir: outDir,
        duration_ms: Date.now() - startedAt,
      });
      jobs.completeJob(job, 'done');
      jobs.deleteJobLater(job.id);
    })().catch(() => {
      jobs.pushEvent(job, {
        type: 'error',
        error_code: 'INTERNAL_SERVER_ERROR',
        message: 'Ocurrió un error inesperado durante la descarga.',
        duration_ms: Date.now() - startedAt,
      });
      jobs.completeJob(job, 'error');
      jobs.deleteJobLater(job.id);
    });
  });
});

router.post('/downloads/direct-link', async (ctx) => {
  const { error, value } = directLinkSchema.validate(ctx.request.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.') || 'body',
      code: 'VALIDATION',
      message: d.message,
    }));
    return fail(
      ctx,
      400,
      'VALIDATION_ERROR',
      'Revisa la URL y las opciones enviadas.',
      details,
    );
  }

  const startedAt = Date.now();
  const result = await runYtDlpGetDirectUrl({
    url: value.url,
    formatPreset: value.formatPreset,
    playlistMode: value.playlistMode,
  });

  if (result.spawnError) {
    return fail(
      ctx,
      500,
      'EXTERNAL_SERVICE_ERROR',
      formatSpawnError(result.spawnError, result.spawnAttempt || ''),
      [],
    );
  }

  if (!result.ok) {
    const message = result.botCheckDetected
      ? 'YouTube pidió verificación anti-bot. Configura YTLINK_YTDLP_COOKIES_FILE o YTLINK_YTDLP_COOKIES_B64 y, si persiste, define YTLINK_YTDLP_YOUTUBE_EXTRACTOR_ARGS con po_token.'
      : result.noUrlFound
        ? 'No fue posible obtener un enlace directo temporal para reproducir.'
        : 'No fue posible generar un enlace directo. Verifica URL/cookies y vuelve a intentar.';
    return fail(
      ctx,
      502,
      'EXTERNAL_SERVICE_ERROR',
      message,
      [{ field: 'url', code: 'NO_DIRECT_URL', message: 'No direct URL returned' }],
    );
  }

  return success(ctx, {
    direct_url: result.directUrl,
    expires_note: 'Enlace temporal; puede expirar en minutos.',
    duration_ms: Date.now() - startedAt,
  });
});

router.get('/downloads/:id/events', async (ctx) => {
  const job = jobs.getJob(ctx.params.id);
  if (!job) {
    return fail(
      ctx,
      404,
      'RESOURCE_NOT_FOUND',
      'No se encontró el trabajo de descarga indicado.',
      [],
    );
  }

  ctx.request.socket.setTimeout(0);
  ctx.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  ctx.status = 200;

  const res = ctx.res;
  jobs.addSseClient(job, res);

  return new Promise((resolve) => {
    const cleanup = () => {
      jobs.removeSseClient(job, res);
      resolve();
    };
    ctx.req.on('close', cleanup);
    ctx.req.on('aborted', cleanup);
  });
});

module.exports = router;
module.exports.isSupportedDownloadUrl = isSupportedDownloadUrl;
