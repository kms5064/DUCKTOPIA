import { redisClient, subscriber } from '../db/redis/redis.js';
import { loadProtos } from './loadProtos.js';
import os from 'os';

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

// 큰 멀티
// 작은 멀티
// 1. list에서 서버 조회
// 2. hashKey 생성 lobby2 lobby3 ...
// 3. 값 저장
// 4. Pub/Sub을 이용해서 서버오픈 알림

const consoleSub = (message, channel) => {
  console.log(message);
  console.log(channel);
};

const InitServer = async () => {
  try {
    await loadProtos();
    // 기존에 Redis에 저장된 서버들 확인 + 그에 따라 index를 올려서 서버 정보 저장

    const hashData = {
      address: getLocalIP(),
      status: 1,
    };

    // 서버 상태 on
    await redisClient.watch('Lobby');
    const getReply = await redisClient.lRange('Lobby', 0, -1);
    await redisClient
      .multi()
      .hSet('Server:Lobby:' + getReply.length, hashData)
      .lPush('Lobby', getLocalIP())
      .publish('ServerOn', 'Server:Lobby:' + getReply.length)
      .exec();
  } catch (err) {
    console.error(err);
  }
};

export default InitServer;
