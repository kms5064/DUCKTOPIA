import net from 'net';
import onConnection from './events/onConnection.js';
import InitServer from './init/initServer.js';
import { config } from './config/config.js';

const server = net.createServer(onConnection);

const startServer = async () => {
  await InitServer();
  server.listen(8888, config.server.host, () => {
    console.log('[로비] 서버 시작!!', 8888);
  });
};

startServer();
