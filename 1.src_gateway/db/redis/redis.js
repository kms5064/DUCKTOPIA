import redis from 'redis';
import { config } from '../../config/config.js';
import net from 'net';
import os from 'os';
import { serverSession } from '../../sessions/session.js';
import onGameConnection from '../../events/game/onGameConnection.js';
import onLobbyConnection from '../../events/lobby/onLobbyConnection.js';

// 프라이빗 IPv4 주소
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let interfaceName in interfaces) {
    for (let iface of interfaces[interfaceName]) {
      // IPv4, 비공개 IP 제외
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
}

// Redis 클라우드 인스턴스에 연결
const redisClient = redis.createClient({
  url:
    'redis://' +
    config.redis.user +
    ':' +
    config.redis.password +
    '@' +
    config.redis.host +
    ':' +
    config.redis.port,
});

const subscriber = redisClient.duplicate();

// 연결 성공 시
redisClient.on('connect', () => {
  console.log('Redis 연결 성공!!');
});

// 연결 실패 시 에러 출력
redisClient.on('error', (err) => {
  console.error('Redis 연결 오류:', err);
});

await redisClient.connect();

subscriber.on('connect', () => {
  console.log('Redis 구독자 연결성공!!');
});

// 연결 실패 시 에러 출력
subscriber.on('error', (err) => {
  console.error('Redis 구독자 오류:', err);
});

await subscriber.connect();

const connectServer = async (name) => {
  const host = await redisClient.hGet(name, 'address');
  const type = name.split(':')[1];
  const portType = {
    Game: [5557, onGameConnection],
    Lobby: [5556, onLobbyConnection],
  };

  const port = portType[type][0];
  if (!port) {
    console.error('잘못된 서버 타입입니다');
    return;
  }

  const newServer = net.createConnection({ host: host, port: port }, () => {
    console.log(`${name}와 연결되었습니다.`);
    portType[type][1](newServer);
  });

  serverSession.addServer(name, newServer);
};

// 새로운 서버 알림 시, 연결
await subscriber.subscribe('ServerOn', connectServer);

const initOnRedis = async () => {
  const host = getLocalIP();
  const hashData = {
    address: host,
    status: 1,
  };

  // 1. list에서 서버 조회
  // 2. hashKey 생성 lobby2 lobby3 ...
  // 3. 값 저장
  // 4. Pub/Sub을 이용해서 서버오픈 알림

  // 서버 상태 on
  await redisClient.watch('Server:Gateway');
  const serverList = await redisClient.lRange('Server:Gateway', 0, -1);
  let index = serverList.indexOf(host);
  if (index < 0) {
    index = serverList.length;
    const setReply = await redisClient
      .multi()
      .hSet('Server:Gateway:' + index, hashData)
      .lPush('Server:Gateway', host)
      .exec();
  } else {
    const setReply = await redisClient
      .multi()
      .hSet('Server:Gateway:' + index, hashData)
      .exec();
  }
  console.log('Redis 서버 알림 성공');
};

export { redisClient, subscriber, initOnRedis };
