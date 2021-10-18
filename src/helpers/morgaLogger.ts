export const morganLogger = (tokens, req, res) => [
  tokens.method(req, res),
  tokens.url(req, res),
  JSON.stringify(req.body),
  tokens['user-agent'](req, res),
].join(' - ');
