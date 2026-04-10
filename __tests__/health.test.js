const request = require('supertest');
const app = require('../app');

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
