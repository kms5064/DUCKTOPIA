import { redisClient } from '../redis.js';
import net from 'net';
import onGameConnection from '../../../events/game/onGameConnection.js';
import onLobbyConnection from '../../../events/lobby/onLobbyConnection.js';
import { serverSession } from '../../../sessions/session.js';

const portType = {
  Game: [5557, onGameConnection],
  Lobby: [5556, onLobbyConnection],
};

const connectServer = async (name) => {
  const [host, status] = await redisClient.hmGet(name, ['address', 'status']);
  if (status !== '1') return;
  const type = name.split(':')[1];
  const port = portType[type][0];
  // 로컬에서 게임서버 2 열때 포트를 다르게 하기
  // if (port === 5557 && name.split(':')[2] === '1') port = 5558;
  if (!port) {
    console.error('잘못된 서버 타입입니다');
    return;
  }

  const newServer = net.createConnection({ host: host, port: port }, () => {
    console.log(`${name}와 연결되었습니다.`);
    // Type에 따라 onConnection 매핑
    portType[type][1](newServer);
  });

  serverSession.addServer(name, newServer);
};

export default connectServer;
