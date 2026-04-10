import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Container,
  Dropdown,
  Form,
  Header,
  Icon,
  Label,
  Message,
  Progress,
  Radio,
  Segment,
} from 'semantic-ui-react';

function formatDuration(ms) {
  if (ms == null || typeof ms !== 'number' || Number.isNaN(ms)) return null;
  if (ms < 800) return 'menos de 1 s';
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h} h ${m} min ${s} s`;
  if (m > 0) return `${m} min ${s} s`;
  return `${s} s`;
}

const FORMAT_OPTIONS = [
  {
    key: 'best',
    value: 'best',
    text: 'Un solo archivo con video y audio (recomendado)',
  },
  {
    key: 'mp4_best',
    value: 'mp4_best',
    text: 'Máxima calidad en MP4 (requiere FFmpeg instalado)',
  },
  { key: 'mp3', value: 'mp3', text: 'Solo audio MP3' },
];

function createJobEntry(jobId, downloadDir) {
  return {
    jobId,
    downloadDir,
    status: 'queued',
    percent: null,
    hint: '',
    errorMessage: '',
    durationMs: null,
    logs: [],
  };
}

export default function App() {
  const [url, setUrl] = useState('');
  const [formatPreset, setFormatPreset] = useState('best');
  const [playlistMode, setPlaylistMode] = useState('auto');
  const [jobs, setJobs] = useState([]);
  const [folderHint, setFolderHint] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const sourcesRef = useRef(new Map());

  const appendLog = useCallback((jobId, line) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.jobId === jobId
          ? {
              ...j,
              logs: [...j.logs, line].slice(-40),
            }
          : j,
      ),
    );
  }, []);

  const patchJob = useCallback((jobId, patch) => {
    setJobs((prev) =>
      prev.map((j) => (j.jobId === jobId ? { ...j, ...patch } : j)),
    );
  }, []);

  const startListening = useCallback(
    (jobId) => {
      const es = new EventSource(`/api/downloads/${jobId}/events`);
      sourcesRef.current.set(jobId, es);

      es.onmessage = (event) => {
        let payload;
        try {
          payload = JSON.parse(event.data);
        } catch {
          return;
        }

        if (payload.type === 'status' && payload.status === 'started') {
          patchJob(jobId, { status: 'running' });
        }
        if (payload.type === 'progress') {
          patchJob(jobId, {
            percent: typeof payload.percent === 'number' ? payload.percent : null,
            hint: payload.label || '',
          });
        }
        if (payload.type === 'log' && payload.message) {
          appendLog(jobId, payload.message);
        }
        if (payload.type === 'done') {
          const dur =
            typeof payload.duration_ms === 'number' ? payload.duration_ms : null;
          const durLabel = formatDuration(dur);
          patchJob(jobId, {
            status: 'done',
            percent:
              typeof payload.percent === 'number' ? payload.percent : 100,
            durationMs: dur,
            hint: durLabel
              ? `Completado en ${durLabel}`
              : 'Descarga completada',
          });
          es.close();
          sourcesRef.current.delete(jobId);
        }
        if (payload.type === 'error') {
          const dur =
            typeof payload.duration_ms === 'number'
              ? payload.duration_ms
              : null;
          patchJob(jobId, {
            status: 'error',
            errorMessage: payload.message || 'Error desconocido',
            durationMs: dur,
          });
          es.close();
          sourcesRef.current.delete(jobId);
        }
      };

      es.onerror = () => {
        patchJob(jobId, {
          status: 'error',
          errorMessage:
            'Se perdió la conexión con el servidor local. ¿Sigue corriendo la API?',
        });
        es.close();
        sourcesRef.current.delete(jobId);
      };
    },
    [appendLog, patchJob],
  );

  useEffect(() => {
    return () => {
      for (const es of sourcesRef.current.values()) {
        es.close();
      }
      sourcesRef.current.clear();
    };
  }, []);

  const submit = async () => {
    setFormError('');
    setBusy(true);
    try {
      const res = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          formatPreset,
          playlistMode,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.success) {
        const msg =
          body.message ||
          'No se pudo iniciar la descarga. Verifica la URL y vuelve a intentar.';
        setFormError(msg);
        return;
      }
      const jobId = body.data.job_id;
      const downloadDir = body.data.download_dir;
      setFolderHint(downloadDir);
      setJobs((prev) => [...prev, createJobEntry(jobId, downloadDir)]);
      startListening(jobId);
    } catch {
      setFormError(
        'No hay conexión con el backend local. Ejecuta el servidor y recarga.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="yl-page">
      <div className="yl-aurora" aria-hidden />
      <Container className="yl-shell">
        <Header as="h1" className="yl-title">
          ytLink
        </Header>
        <p className="yl-subtitle">
          Pega un enlace de YouTube, elige formato y guarda todo en tu disco,
          sin subir archivos a la nube.
        </p>

        <Segment raised className="yl-glass">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <Form.Field>
              <label htmlFor="yl-url">Enlace de YouTube</label>
              <Form.Input
                id="yl-url"
                data-testid="yt-url-input"
                placeholder="https://www.youtube.com/watch?v=…"
                value={url}
                onChange={(_, d) => setUrl(d.value)}
                fluid
              />
            </Form.Field>

            <Form.Field>
              <label>Formato</label>
              <Dropdown
                selection
                fluid
                options={FORMAT_OPTIONS}
                value={formatPreset}
                onChange={(_, d) => setFormatPreset(d.value)}
              />
            </Form.Field>

            <Form.Field>
              <label>Playlist</label>
              <Radio
                label="Automático (según el enlace)"
                name="playlistMode"
                value="auto"
                checked={playlistMode === 'auto'}
                onChange={() => setPlaylistMode('auto')}
              />
              <Radio
                label="Solo este video (evita listas enlazadas)"
                name="playlistMode"
                value="video_only"
                checked={playlistMode === 'video_only'}
                onChange={() => setPlaylistMode('video_only')}
                style={{ marginTop: '0.5rem' }}
              />
            </Form.Field>

            {formError ? (
              <Message negative content={formError} />
            ) : null}

            {folderHint ? (
              <Message
                info
                icon="folder open"
                content={`Guardando en: ${folderHint}`}
              />
            ) : null}

            <Button
              primary
              type="submit"
              fluid
              size="large"
              className="yl-cta"
              loading={busy}
              disabled={busy || !url.trim()}
              data-testid="start-download"
            >
              <Icon name="download" />
              Descargar
            </Button>
          </Form>
        </Segment>

        {jobs.length ? (
          <Header as="h2" className="yl-section-title">
            Descargas
          </Header>
        ) : null}

        {jobs.map((j) => (
          <Segment
            key={j.jobId}
            raised
            className={[
              'yl-glass',
              'yl-job',
              j.status === 'done' ? 'yl-job--done' : '',
              j.status === 'error' ? 'yl-job--err' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="yl-job-head">
              <span className="yl-job-id" title={j.jobId}>
                {j.jobId.slice(0, 8)}…
              </span>
              <Label
                circular
                className={
                  j.status === 'done'
                    ? 'yl-tag yl-tag--ok'
                    : j.status === 'error'
                      ? 'yl-tag yl-tag--err'
                      : 'yl-tag yl-tag--run'
                }
              >
                {j.status === 'done'
                  ? 'Listo'
                  : j.status === 'error'
                    ? 'Error'
                    : 'En progreso'}
              </Label>
            </div>

            <Progress
              percent={j.percent != null ? Math.min(100, j.percent) : 0}
              indicating
              active={j.status === 'running' || j.status === 'queued'}
              success={j.status === 'done'}
              error={j.status === 'error'}
              className={[
                'yl-progress',
                j.status === 'done' || j.status === 'error'
                  ? 'yl-progress--settled'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {j.hint ||
                (j.status === 'queued'
                  ? 'En cola…'
                  : j.status === 'running'
                    ? 'Descargando…'
                    : 'Progreso')}
            </Progress>

            {j.status === 'done' && formatDuration(j.durationMs) ? (
              <div className="yl-done-meta" aria-live="polite">
                <span className="yl-stat-pill">
                  <Icon name="clock outline" />
                  <span className="yl-stat-pill__label">Tiempo total</span>
                  <span className="yl-stat-pill__value">
                    {formatDuration(j.durationMs)}
                  </span>
                </span>
                <span className="yl-stat-pill yl-stat-pill--subtle">
                  <Icon name="folder open outline" />
                  <span className="yl-stat-pill__label">Carpeta</span>
                  <span
                    className="yl-stat-pill__value yl-stat-pill__value--path"
                    title={j.downloadDir}
                  >
                    {j.downloadDir}
                  </span>
                </span>
              </div>
            ) : null}

            {j.status === 'error' && formatDuration(j.durationMs) ? (
              <p className="yl-error-timing">
                Tiempo hasta el fallo:{' '}
                <strong>{formatDuration(j.durationMs)}</strong>
              </p>
            ) : null}

            {j.errorMessage ? (
              <Message negative size="small" content={j.errorMessage} />
            ) : null}

            {j.logs.length ? (
              <details className="yl-tech-log">
                <summary className="yl-tech-log__summary">
                  Salida técnica (yt-dlp)
                </summary>
                <pre
                  className="yl-log"
                  data-testid={`log-${j.jobId}`}
                >
                  {j.logs.join('\n')}
                </pre>
              </details>
            ) : null}
          </Segment>
        ))}

        <p className="yl-footnote">
          Requiere{' '}
          <a
            href="https://github.com/yt-dlp/yt-dlp"
            target="_blank"
            rel="noreferrer"
          >
            yt-dlp
          </a>{' '}
          en tu equipo. Si eliges “Máxima calidad en MP4”, también necesitas{' '}
          <a href="https://ffmpeg.org/download.html" target="_blank" rel="noreferrer">
            FFmpeg
          </a>{' '}
          (o configura FFMPEG_PATH en <code>.env</code>) para unir video y audio en un solo
          archivo; sin eso yt-dlp deja dos archivos separados.
        </p>
      </Container>
    </div>
  );
}
