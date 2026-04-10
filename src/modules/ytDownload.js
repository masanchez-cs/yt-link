const { spawn } = require('child_process');
const path = require('path');
const {
  resolveYtDlpExecutable,
  normalizeExecutablePath,
} = require('../system/resolveYtDlp');

const PROGRESS_RE = /\[download\]\s+(\d{1,3}\.\d)%/;
const MERGER_RE = /\[Merger\]\s+Merging formats into\s+"(.+?)"/;

function ytDlpBinary() {
  return resolveYtDlpExecutable();
}

function buildArgs({ url, formatPreset, playlistMode, outDir }) {
  const args = [
    '--newline',
    '--progress',
    '--no-warnings',
    '--restrict-filenames',
    '-o',
    path.join(outDir, '%(title)s_[%(id)s].%(ext)s'),
  ];

  const ffmpegLoc = normalizeExecutablePath(process.env.FFMPEG_PATH);
  if (ffmpegLoc) {
    args.push('--ffmpeg-location', ffmpegLoc);
  }

  if (playlistMode === 'video_only') {
    args.push('--no-playlist');
  }

  switch (formatPreset) {
    case 'mp3':
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
      break;
    case 'best':
      args.push('-f', 'best');
      break;
    case 'mp4_best':
    default:
      args.push('-f', 'bv*+ba/b', '--merge-output-format', 'mp4');
      break;
  }

  args.push(url);
  return args;
}

function runYtDlp(job, { url, formatPreset, playlistMode, outDir, onEvent }) {
  const bin = ytDlpBinary();
  const args = buildArgs({ url, formatPreset, playlistMode, outDir });
  const child = spawn(bin, args, {
    shell: false,
    windowsHide: true,
  });

  let lastPercent = null;
  let mergedPath = null;

  const handleLine = (line, stream) => {
    const text = line.toString().trimEnd();
    if (!text) return;

    onEvent({ type: 'log', stream, message: text });

    const m = text.match(PROGRESS_RE);
    if (m) {
      const n = Number(m[1]);
      if (!Number.isNaN(n)) {
        lastPercent = n;
        onEvent({ type: 'progress', percent: n, label: text });
      }
    }

    const mm = text.match(MERGER_RE);
    if (mm) {
      mergedPath = mm[1];
    }
  };

  let stderrBuf = '';
  let stdoutBuf = '';

  child.stderr.on('data', (chunk) => {
    stderrBuf += chunk.toString();
    let idx;
    while ((idx = stderrBuf.indexOf('\n')) >= 0) {
      const line = stderrBuf.slice(0, idx);
      stderrBuf = stderrBuf.slice(idx + 1);
      handleLine(line, 'stderr');
    }
  });

  child.stdout.on('data', (chunk) => {
    stdoutBuf += chunk.toString();
    let idx;
    while ((idx = stdoutBuf.indexOf('\n')) >= 0) {
      const line = stdoutBuf.slice(0, idx);
      stdoutBuf = stdoutBuf.slice(idx + 1);
      handleLine(line, 'stdout');
    }
  });

  return new Promise((resolve) => {
    child.on('close', (code) => {
      if (stderrBuf.trim()) handleLine(stderrBuf, 'stderr');
      if (stdoutBuf.trim()) handleLine(stdoutBuf, 'stdout');

      if (code === 0) {
        resolve({
          ok: true,
          lastPercent,
          mergedPath,
        });
      } else {
        resolve({
          ok: false,
          code,
          lastPercent,
          mergedPath,
        });
      }
    });

    child.on('error', (err) => {
      resolve({
        ok: false,
        spawnError: err,
        spawnAttempt: bin,
      });
    });
  });
}

module.exports = { runYtDlp, ytDlpBinary, buildArgs };
