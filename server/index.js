const { env } = require('process');
const Koa = require('koa');
const serve = require('koa-static');
const logger = require('koa-logger');
const koaRouter = require('koa-router');
const cors = require('@koa/cors');
const consola = require('consola');

const { setup: setupLogger, connect: connectLogger } = require('./logger');
const createWebSocket = require('./createWebSocket');

const host = env.HOST || '127.0.0.1';
const port = env.PORT || 3333;

function start() {
  const app = new Koa();
  const router = koaRouter();

  app.use(logger());
  app.use(cors());
  app.use(serve('dist'));

  const echo = createWebSocket();
  echo.onMessage = console.log;
  setupLogger({ mode: env.RAILS_ENV, port: env.RAILS_PORT });
  router.get('/log', connectLogger);
  router.get('/echo', echo.upgradeHandler);
  app.use(router.routes());

  app.listen(port, host);
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true,
  });
}

start();
