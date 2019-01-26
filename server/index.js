const { env } = require('process');
const Koa = require('koa');
const serve = require('koa-static');
const logger = require('koa-logger');
const koaRouter = require('koa-router');
const cors = require('@koa/cors');
const consola = require('consola');

const connectLogger = require('./logger');

const host = env.HOST || '127.0.0.1';
const port = env.PORT || 3333;

function start() {
  const app = new Koa();
  const router = koaRouter();

  app.use(logger());
  app.use(cors());
  app.use(serve('dist'));

  router.get('/log', connectLogger);
  app.use(router.routes());

  app.listen(port, host);
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true,
  });
}

start();
