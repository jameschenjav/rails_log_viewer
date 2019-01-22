const Koa = require('koa');
const serve = require('koa-static');
const logger = require('koa-logger');
const koaRouter = require('koa-router');
const consola = require('consola');

const connectLogger = require('./logger');

const host = '0.0.0.0';
const port = 3333;

function start() {
  const app = new Koa();
  const router = koaRouter();

  app.use(logger());
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
