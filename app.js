require('dotenv').config();
const http = require('http');
const Koa = require('koa');
const cors = require('@koa/cors');
const { koaBody } = require('koa-body');
const Router = require('@koa/router');
const { randomUUID } = require('crypto');

const path = require('path');
const { fail } = require('./src/system/response');
const healthRouter = require('./routes/health');
const downloadsRouter = require('./routes/downloads');

const app = new Koa();
const api = new Router({ prefix: '/api' });
const distDir = path.join(__dirname, 'client', 'dist');

app.use(async (ctx, next) => {
  const incoming = ctx.get('x-trace-id');
  ctx.state.traceId = incoming && incoming.trim() ? incoming.trim() : randomUUID();
  await next();
});

app.use(async (ctx, next) => {
  ctx.set('X-Content-Type-Options', 'nosniff');
  ctx.set('Referrer-Policy', 'no-referrer');
  ctx.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  await next();
});

function corsOriginsList() {
  const raw = process.env.CORS_ORIGIN || 'http://localhost:5173';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

app.use(
  cors({
    origin(ctx) {
      const allowed = corsOriginsList();
      const reqOrigin = ctx.get('Origin');
      if (!reqOrigin) {
        return '';
      }
      return allowed.includes(reqOrigin) ? reqOrigin : false;
    },
    credentials: true,
  }),
);

app.use(
  koaBody({
    jsonLimit: '1mb',
    multipart: false,
  }),
);

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const status = err.status && Number.isInteger(err.status) ? err.status : 500;
    const code =
      status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR';
    const message =
      status === 400
        ? 'La solicitud no pudo procesarse.'
        : 'Ocurrió un error interno. Intenta de nuevo más tarde.';
    fail(ctx, status, code, message, []);
    ctx.app.emit('error', err, ctx);
  }
});

api.use(healthRouter.routes());
api.use(downloadsRouter.routes());

app.use(api.routes());
app.use(api.allowedMethods());

if (process.env.NODE_ENV === 'production') {
  const serve = require('koa-static');
  const send = require('koa-send');
  app.use(serve(distDir));
  app.use(async (ctx, next) => {
    await next();
    if (
      ctx.status === 404 &&
      ctx.method === 'GET' &&
      !ctx.path.startsWith('/api')
    ) {
      try {
        await send(ctx, 'index.html', { root: distDir });
      } catch {
        /* ignore */
      }
    }
  });
}

const port = Number(process.env.PORT) || 3847;

module.exports = app;

if (require.main === module) {
  const server = http.createServer(app.callback());
  server.listen(port, () => {
    const logLevel = process.env.LOG_LEVEL || 'info';
    if (logLevel !== 'silent') {
      // eslint-disable-next-line no-console
      console.log(`ytlink API escuchando en http://localhost:${port}`);
    }
  });
}
