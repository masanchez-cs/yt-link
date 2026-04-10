const Router = require('@koa/router');
const { success } = require('../src/system/response');

const router = new Router();

router.get('/health', async (ctx) => {
  success(ctx, { ok: true });
});

module.exports = router;
