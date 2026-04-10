const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let cached;

function normalizeExecutablePath(value) {
  if (value == null || typeof value !== 'string') return '';
  let s = value.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function whereExe() {
  const root = process.env.SystemRoot || process.env.windir || 'C:\\Windows';
  return path.join(root, 'System32', 'where.exe');
}

/**
 * Resuelve la ruta al ejecutable de yt-dlp (Windows suele necesitar ruta completa o .exe).
 */
function resolveYtDlpExecutable() {
  if (cached) return cached;

  const raw = normalizeExecutablePath(process.env.YT_DLP_PATH);

  const looksLikePath =
    raw &&
    (path.isAbsolute(raw) ||
      raw.includes(path.sep) ||
      raw.includes('/') ||
      raw.endsWith('.exe'));

  if (looksLikePath) {
    const abs = path.resolve(raw);
    if (fs.existsSync(abs)) {
      cached = abs;
      return cached;
    }
    cached = abs;
    return cached;
  }

  const tryWhere = (name) => {
    if (process.platform !== 'win32') return null;
    try {
      const out = execFileSync(whereExe(), [name], {
        encoding: 'utf8',
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const first = out
        .split(/\r?\n/)
        .map((s) => s.trim())
        .find((line) => line && !line.startsWith('INFO:'));
      if (first && fs.existsSync(first)) return first;
    } catch {
      /* ignorar */
    }
    return null;
  };

  const candidates = [];
  if (raw) candidates.push(raw);
  if (process.platform === 'win32') {
    candidates.push('yt-dlp.exe', 'yt-dlp');
  } else {
    candidates.push('yt-dlp');
  }

  for (const name of candidates) {
    if (!name || name.includes(path.sep) || name.includes('/')) continue;
    const hit = tryWhere(name);
    if (hit) {
      cached = hit;
      return cached;
    }
  }

  cached = raw || (process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
  return cached;
}

function formatSpawnError(err, attemptedPath) {
  if (!err) {
    return 'No se pudo ejecutar yt-dlp. Configura YT_DLP_PATH con la ruta completa al .exe.';
  }
  if (err.code === 'ENOENT') {
    return (
      `No se encontró el programa yt-dlp (intentado: "${attemptedPath}"). ` +
      'Instálalo (por ejemplo: winget install yt-dlp.yt-dlp) o en .env pon YT_DLP_PATH con la ruta completa, ' +
      'p. ej. C:\\Users\\TU_USUARIO\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\yt-dlp.exe'
    );
  }
  return `No se pudo ejecutar yt-dlp: ${err.message || err.code || 'error desconocido'}`;
}

module.exports = {
  resolveYtDlpExecutable,
  normalizeExecutablePath,
  formatSpawnError,
};
