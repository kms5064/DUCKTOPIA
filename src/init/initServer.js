import { initOnRedis } from '../db/redis/redis.js';
import { loadProtos } from './loadProtos.js';

const InitServer = async () => {
  try {
    await loadProtos();
    // 기존에 Redis에 저장된 서버들 확인 + 그에 따라 index를 올려서 서버 정보 저장
    await initOnRedis();
  } catch (err) {
    console.error(err);
  }
};

export default InitServer;
