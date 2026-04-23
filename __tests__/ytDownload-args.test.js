const path = require('path');

describe('buildArgs youtube extractor args', () => {
  const { buildArgs, buildDirectUrlArgs } = require('../src/modules/ytDownload');
  const prevClients = process.env.YTLINK_YTDLP_PLAYER_CLIENTS;
  const prevExtraExtractorArgs = process.env.YTLINK_YTDLP_YOUTUBE_EXTRACTOR_ARGS;
  const prevProxy = process.env.YTLINK_YTDLP_PROXY;

  afterEach(() => {
    if (prevClients === undefined) {
      delete process.env.YTLINK_YTDLP_PLAYER_CLIENTS;
    } else {
      process.env.YTLINK_YTDLP_PLAYER_CLIENTS = prevClients;
    }
    if (prevExtraExtractorArgs === undefined) {
      delete process.env.YTLINK_YTDLP_YOUTUBE_EXTRACTOR_ARGS;
    } else {
      process.env.YTLINK_YTDLP_YOUTUBE_EXTRACTOR_ARGS = prevExtraExtractorArgs;
    }
    if (prevProxy === undefined) {
      delete process.env.YTLINK_YTDLP_PROXY;
    } else {
      process.env.YTLINK_YTDLP_PROXY = prevProxy;
    }
  });

  function callBuildArgs() {
    return buildArgs({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      formatPreset: 'mp4_best',
      playlistMode: 'video_only',
      outDir: path.resolve('.'),
    });
  }

  it('usa fallback de clients por defecto', () => {
    delete process.env.YTLINK_YTDLP_PLAYER_CLIENTS;
    const args = callBuildArgs();
    expect(args).toContain('--extractor-args');
    expect(args).toContain(
      'youtube:player_client=tv_embedded,mweb,web_safari,default',
    );
  });

  it('permite override de clients por variable de entorno', () => {
    process.env.YTLINK_YTDLP_PLAYER_CLIENTS = 'mweb,default';
    const args = callBuildArgs();
    expect(args).toContain('youtube:player_client=mweb,default');
  });

  it('concatena extractor args extra (ej. po_token)', () => {
    process.env.YTLINK_YTDLP_PLAYER_CLIENTS = 'mweb';
    process.env.YTLINK_YTDLP_YOUTUBE_EXTRACTOR_ARGS =
      'po_token=mweb.gvs+TOKEN_EJEMPLO';
    const args = callBuildArgs();
    expect(args).toContain(
      'youtube:player_client=mweb;po_token=mweb.gvs+TOKEN_EJEMPLO',
    );
  });

  it('agrega --proxy cuando YTLINK_YTDLP_PROXY está definido', () => {
    process.env.YTLINK_YTDLP_PROXY = 'http://user:pass@proxy.resi:8080';
    const args = callBuildArgs();
    expect(args).toContain('--proxy');
    expect(args).toContain('http://user:pass@proxy.resi:8080');
  });

  it('no agrega extractor-args de youtube para URL directa googlevideo', () => {
    const args = buildArgs({
      url: 'https://rr1---sn-abc.googlevideo.com/videoplayback?source=youtube&id=123',
      formatPreset: 'mp4_best',
      playlistMode: 'video_only',
      outDir: path.resolve('.'),
    });
    expect(args).not.toContain('--extractor-args');
    expect(args.some((a) => String(a).startsWith('youtube:player_client='))).toBe(
      false,
    );
  });

  it('buildDirectUrlArgs usa -g y formato mp4 progresivo por defecto', () => {
    const args = buildDirectUrlArgs({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      formatPreset: 'best',
      playlistMode: 'video_only',
    });
    expect(args).toContain('-g');
    expect(args).toContain('-f');
    expect(args).toContain('best[ext=mp4]/best');
    expect(args).toContain('--no-playlist');
  });

  it('buildDirectUrlArgs usa bestaudio cuando el preset es mp3', () => {
    const args = buildDirectUrlArgs({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      formatPreset: 'mp3',
      playlistMode: 'auto',
    });
    expect(args).toContain('-f');
    expect(args).toContain('bestaudio');
    expect(args).not.toContain('--no-playlist');
  });
});
