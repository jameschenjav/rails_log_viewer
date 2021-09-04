import { env } from 'process';
import fastifyCors from 'fastify-cors';
import fastifyStatic from 'fastify-static';
import fastifyWebsocket from 'fastify-websocket';
import fastifyHttpProxy from 'fastify-http-proxy';

import {
  server, host, port, dist,
} from './server';
import {
  wsConnectionHandler, startHeartBeat, stopHeartBeat, startIpc,
} from './socket';

server.register(fastifyWebsocket);

server.get('/api', { websocket: true }, (connection) => {
  server.log.debug('GET /api');
  wsConnectionHandler(connection);
});

server.get('/test', (req, res) => {
  server.log.debug('GET /test');
  res.send({ hello: 'world' });
});

startIpc();
const hb = startHeartBeat();

console.debug({ NODE_ENV: env.NODE_ENV });

if (env.NODE_ENV === 'development') {
  server.register(fastifyCors);

  const devHost = env.DEV_SERVER_HOST || '127.0.0.1';

  const devPort = Number(env.DEV_SERVER_PORT || '3456') || 3456;

  server.register(fastifyHttpProxy, {
    upstream: `http://${devHost}:${devPort}`,
    prefix: '/',
    rewritePrefix: '/',
    http2: false,
  });
} else {
  server.register(fastifyStatic, {
    root: dist,
  });
}

server.listen(port, host, (err, address) => {
  stopHeartBeat(hb);
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
