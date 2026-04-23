const fs = require('fs');
const os = require('os');
const path = require('path');

describe('resolveYtDlpCookiesPath', () => {
  const { resolveYtDlpCookiesPath } = require('../src/modules/ytDownload');

  const prev = process.env.YTLINK_YTDLP_COOKIES_FILE;
  const prevB64 = process.env.YTLINK_YTDLP_COOKIES_B64;

  afterEach(() => {
    if (prev === undefined) {
      delete process.env.YTLINK_YTDLP_COOKIES_FILE;
    } else {
      process.env.YTLINK_YTDLP_COOKIES_FILE = prev;
    }
    if (prevB64 === undefined) {
      delete process.env.YTLINK_YTDLP_COOKIES_B64;
    } else {
      process.env.YTLINK_YTDLP_COOKIES_B64 = prevB64;
    }
  });

  it('sin variable: no cookies', () => {
    delete process.env.YTLINK_YTDLP_COOKIES_FILE;
    const r = resolveYtDlpCookiesPath();
    expect(r.path).toBeNull();
    expect(r.missingRequested).toBe(false);
  });

  it('archivo existente: path absoluto', () => {
    const f = path.join(os.tmpdir(), `ytlink-cookies-${Date.now()}.txt`);
    fs.writeFileSync(f, '# Netscape HTTP Cookie File\n', 'utf8');
    process.env.YTLINK_YTDLP_COOKIES_FILE = f;
    const r = resolveYtDlpCookiesPath();
    try {
      expect(r.path).toBe(path.resolve(f));
      expect(r.missingRequested).toBe(false);
    } finally {
      fs.unlinkSync(f);
    }
  });

  it('ruta inexistente: missingRequested', () => {
    process.env.YTLINK_YTDLP_COOKIES_FILE = path.join(
      os.tmpdir(),
      'no-existe-ytlink-cookies.txt',
    );
    const r = resolveYtDlpCookiesPath();
    expect(r.path).toBeNull();
    expect(r.missingRequested).toBe(true);
  });

  it('usa YTLINK_YTDLP_COOKIES_B64 cuando existe', () => {
    delete process.env.YTLINK_YTDLP_COOKIES_FILE;
    process.env.YTLINK_YTDLP_COOKIES_B64 = Buffer.from(
      '# Netscape HTTP Cookie File\n.youtube.com\tTRUE\t/\tTRUE\t2147483647\tSID\tabc\n',
      'utf8',
    ).toString('base64');
    const r = resolveYtDlpCookiesPath();
    expect(typeof r.path).toBe('string');
    expect(r.path).toContain('ytlink-cookies-');
    expect(fs.existsSync(r.path)).toBe(true);
  });

  it('marca invalidB64 cuando cookies b64 no son válidas', () => {
    delete process.env.YTLINK_YTDLP_COOKIES_FILE;
    process.env.YTLINK_YTDLP_COOKIES_B64 = '%%%not_base64%%%';
    const r = resolveYtDlpCookiesPath();
    expect(r.path).toBeNull();
    expect(r.invalidB64).toBe(true);
  });
});
