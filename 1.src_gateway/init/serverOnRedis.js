import os from 'os';
import { redisClient } from '../db/redis/redis.js';
import connectServer from '../db/redis/subscribe/connectServer.js';

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
  };

  await redisClient.watch('Server:Gateway');
  // [1] list에서 서버 조회
  const serverList = await redisClient.lRange('Server:Gateway', 0, -1);
  let index = serverList.indexOf(host);
  let name = 'Server:Gateway:';
  // [2] hashKey 생성 lobby:2 lobby:3 ... + 값 저장
  // [3] 중복 여부에따라 List 업데이트
  if (index < 0) {
    name = 'Server:Gateway:';
    await redisClient
      .multi()
      .hSet(name + serverList.length, hashData)
      .rPush('Server:Gateway', host)
      .exec();
  } else {
    await redisClient
      .multi()
      .hSet(name + index, hashData)
      .exec();
  }

  console.log('Redis 서버 오픈 알림 성공');

  // Gateway 서버의 연결 부
  const LobbyServers = await redisClient.lRange('Server:Lobby', 0, -1);
  for (let i = 0; i < LobbyServers.length; i++) {
    await connectServer('Server:Lobby:' + i); //로비서버 TCP연결
  }

  const GameServers = await redisClient.lRange('Server:Game', 0, -1);
  for (let i = 0; i < GameServers.length; i++) {
    await connectServer('Server:Game:' + i); //게임서버 TCP연결
  }

  console.log('Redis List 모든 서버 연결 성공');
};

export default serverOnRedis;
