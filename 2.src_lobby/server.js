import net from 'net';
import onConnection from './events/onConnection.js';
import InitServer from './init/initServer.js';
import { config } from './config/config.js';
import serverOnRedis from './init/serverOnRedis.js';

const server = net.createServer(onConnection);

const startServer = async () => {
  await InitServer();
  server.listen(config.server.port, config.server.host, async () => {
    await serverOnRedis();
    console.log('[로비] 서버 시작!!', config.server.port);
  });
};

startServer();
