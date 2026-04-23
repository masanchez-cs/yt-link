const request = require('supertest');
const app = require('../app');
const downloadsRouter = require('../routes/downloads');

describe('GET /api/health', () => {
  it('responde éxito con trace_id', async () => {
    const res = await request(app.callback()).get('/api/health').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ ok: true });
    expect(typeof res.body.trace_id).toBe('string');
  });
});

describe('POST /api/downloads', () => {
  it('rechaza URL que no es de YouTube', async () => {
    const res = await request(app.callback())
      .post('/api/downloads')
      .send({ url: 'https://example.com/video', formatPreset: 'mp4_best' })
      .expect(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error_code).toBe('VALIDATION_ERROR');
  });
});

describe('downloads URL support', () => {
  it('acepta URL directa de googlevideo videoplayback', () => {
    expect(
      downloadsRouter.isSupportedDownloadUrl(
        'https://rr1---sn-abc.googlevideo.com/videoplayback?source=youtube&id=xyz',
      ),
    ).toBe(true);
  });
});

describe('POST /api/downloads/direct-link', () => {
  it('rechaza URL que no corresponde a orígenes soportados', async () => {
    const res = await request(app.callback())
      .post('/api/downloads/direct-link')
      .send({ url: 'https://example.com/video.mp4' })
      .expect(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error_code).toBe('VALIDATION_ERROR');
  });
});
