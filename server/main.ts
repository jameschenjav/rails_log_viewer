import { env } from 'process';
import { resolve } from 'path';
import Koa from 'koa';
import serve from 'koa-static';
import logger from 'koa-logger';
import Router from 'koa-router';
import cors from '@koa/cors';
import consola from 'consola';

import { wsServer, startIpc } from './socket';

const host = env.HOST || '0.0.0.0';
const port = +(env.PORT || 8030);

const start = (): void => {
  const app = new Koa();
  const router = new Router();

  router.get('/api', wsServer.entryPoint);

  app.use(logger());
  app.use(cors());
  app.use(serve(resolve(__dirname, '../public')));

  app.use(router.routes());

  app.listen(port, host);
  startIpc();
  consola.info(`Server listening on http://${host}:${port}`);
};

start();
