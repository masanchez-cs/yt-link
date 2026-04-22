const path = require('path');

describe('buildArgs youtube extractor args', () => {
  const { buildArgs } = require('../src/modules/ytDownload');
  const prevClients = process.env.YTLINK_YTDLP_PLAYER_CLIENTS;
  const prevExtraExtractorArgs = process.env.YTLINK_YTDLP_YOUTUBE_EXTRACTOR_ARGS;

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
});
