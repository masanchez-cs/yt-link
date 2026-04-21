const fs = require('fs');
const os = require('os');
const path = require('path');

describe('resolveYtDlpCookiesPath', () => {
  const { resolveYtDlpCookiesPath } = require('../src/modules/ytDownload');

  const prev = process.env.YTLINK_YTDLP_COOKIES_FILE;

  afterEach(() => {
    if (prev === undefined) {
      delete process.env.YTLINK_YTDLP_COOKIES_FILE;
    } else {
      process.env.YTLINK_YTDLP_COOKIES_FILE = prev;
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
});
