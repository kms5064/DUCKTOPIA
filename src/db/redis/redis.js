import redis from 'redis';
import { config } from '../../config/config.js';
import os from 'os';

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

const initOnRedis = async () => {
  const hashData = {
    address: getLocalIP(),
    status: 1,
  };

  // 1. list에서 서버 조회
  // 2. hashKey 생성 lobby2 lobby3 ...
  // 3. 값 저장
  // 4. Pub/Sub을 이용해서 서버오픈 알림

  // 서버 상태 on
  await redisClient.watch('Server:Game');
  const serverList = await redisClient.lRange('Server:Game', 0, -1);
  const setReply = await redisClient
    .multi()
    .hSet('Server:Game:' + serverList.length, hashData)
    .lPush('Server:Game', getLocalIP())
    .publish('ServerOn', 'Server:Game:' + serverList.length)
    .exec();
  console.log('Redis 서버 알림 성공');
};

export { redisClient, subscriber, initOnRedis };
