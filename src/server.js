import net from 'net';
import onConnection from './events/onConnection.js';
import InitServer from './init/initServer.js';
import { config } from './config/config.js';
import logger from './utils/winstonSetting.js';

const server = net.createServer(onConnection);

const startServer = async () => {
  logger.info("서버 시작 체크");
  await InitServer();
  server.listen(config.server.port, config.server.host, () => {
    console.log('서버 시작!!');
  });
};

startServer();
