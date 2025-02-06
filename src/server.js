import net from 'net';
import onConnection from './events/onConnection.js'
import InitServer from './init/initServer.js';
import { config } from './config/config.js';


const server = net.createServer(onConnection);

const startServer = async () => {
  await InitServer();
  server.listen(config.env.port, config.env.host, () => {
    console.log('서버 시작!!');
  });
};

startServer();