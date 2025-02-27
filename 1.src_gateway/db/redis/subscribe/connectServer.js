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
  try {
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

    const newServer = await new Promise((resolve, reject) => {
      const connection = net.createConnection({ host: host, port: port }, () => {
        console.log(`${name}와 연결되었습니다.`);
        // Type에 따라 onConnection 매핑
        portType[type][1](connection);
        resolve(connection);
      });
      connection.on('error', reject);
    });

    serverSession.addServer(name, newServer);
  } catch (err) {
    console.log('서버 연결 중 올바르지 못한 서버기록 오류');
    console.error(err);
  }
};

export default connectServer;
