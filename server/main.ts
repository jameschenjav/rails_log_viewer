import { env } from 'process';
import fastifyCors from 'fastify-cors';
import fastifyStatic from 'fastify-static';
import fastifyWebsocket from 'fastify-websocket';

import {
  server, host, port, staticAssets,
} from './server';
import {
  wsConnectionHandler, startHeartBeat, stopHeartBeat, startIpc,
} from './socket';

server.register(fastifyWebsocket);

server.register(fastifyCors);

server.get('/api', { websocket: true }, (connection) => {
  server.log.debug('GET /api');
  wsConnectionHandler(connection);
});

console.debug({ NODE_ENV: env.NODE_ENV });

if (env.NODE_ENV === 'development') {
  server.get('/test', (req, res) => {
    server.log.debug('GET /test');
    res.send({ hello: 'world' });
  });
} else {
  server.register(fastifyStatic, {
    root: staticAssets,
  });
}

startIpc();
const hb = startHeartBeat();

server.listen(port, host, (err, address) => {
  stopHeartBeat(hb);
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
