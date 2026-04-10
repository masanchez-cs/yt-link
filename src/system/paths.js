const fs = require('fs');
const path = require('path');

function defaultDownloadBase() {
  const home =
    process.env.USERPROFILE || process.env.HOME || process.cwd();
  const downloads = path.join(home, 'Downloads');
  return path.join(downloads, 'ytLink');
}

function resolveDownloadBase() {
  const fromEnv = process.env.YTLINK_DOWNLOAD_DIR;
  const raw = fromEnv && fromEnv.trim() ? fromEnv.trim() : defaultDownloadBase();
  const resolved = path.resolve(raw);
  fs.mkdirSync(resolved, { recursive: true });
  return resolved;
}

module.exports = { defaultDownloadBase, resolveDownloadBase };
