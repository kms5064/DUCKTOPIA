import os from 'os';
import { redisClient, subscriber } from '../db/redis/redis.js';
import { gameSession } from '../sessions/session.js';
import healthCheck from '../db/redis/subscribe/healthCheck.js';

// 프라이빗 IPv4 주소
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let interfaceName in interfaces) {
    for (let iface of interfaces[interfaceName]) {
      // IPv4, 비공개 IP 제외
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
}

const serverOnRedis = async () => {
  const host = getLocalIP();
  const hashData = {
    // 서버 주소
    address: host,
    // 서버 상태
    status: 1,
    check: 'new',
    games: 0,
  };

  await redisClient.watch('Server:Game');
  // [1] list에서 서버 조회
  const serverList = await redisClient.lRange('Server:Game', 0, -1);

  const index = serverList.length;
  const name = 'Server:Game:' + index;
  await redisClient
    .multi()
    .hSet(name, hashData)
    .lPush('Server:Game', host)
    .publish('ServerOn', name)
    .exec();

  gameSession.name = name;
  // 헬스체크 Sub 매핑
  subscriber.subscribe(name, healthCheck);

  console.log('Redis 서버 오픈 알림 성공');
};

export default serverOnRedis;
