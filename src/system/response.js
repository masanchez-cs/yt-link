function success(ctx, data = {}, message = '') {
  ctx.status = 200;
  ctx.body = {
    success: true,
    data,
    message,
    trace_id: ctx.state.traceId || '',
  };
}

function fail(ctx, status, errorCode, message, details = []) {
  ctx.status = status;
  ctx.body = {
    success: false,
    error_code: errorCode,
    message,
    details,
    trace_id: ctx.state.traceId || '',
  };
}

module.exports = { success, fail };
