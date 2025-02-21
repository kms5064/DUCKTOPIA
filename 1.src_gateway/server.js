import net from 'net';
import onConnection from './events/onConnection.js';
import onGameConnection from './events/game/onGameConnection.js';
import onLobbyConnection from './events/lobby/onLobbyConnection.js';
import InitServer from './init/initServer.js';
import { config } from './config/config.js';
import { serverSession } from './sessions/session.js';

const server = net.createServer(onConnection);

const startServer = async () => {
  await InitServer();
  connectToLobbyServer(); //로비서버 TCP연결
  connectToGameServer(); //게임서버 TCP연결

  server.listen(config.server.port, config.server.host, () => {
    console.log('[게이트웨이] 서버 시작!!', config.server.port);
  });
};

const connectToLobbyServer = () => {
  const lobbyServer = net.createConnection({ host: '15.164.234.36', port: 5556 }, () => {
    console.log('로비서버와 연결되었습니다.');
    onLobbyConnection(lobbyServer);
  });

  serverSession.addServer(config.server.lobbyServer, lobbyServer);
};

const connectToGameServer = () => {
  const gameServer = net.createConnection({ host: '43.201.105.88', port: 5557 }, () => {
    console.log('게임서버와 연결되었습니다.');
    onGameConnection(gameServer);
  });

  serverSession.addServer(config.server.gameServer, gameServer);
};

startServer();
