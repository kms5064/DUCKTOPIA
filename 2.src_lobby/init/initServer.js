import { initOnRedis } from '../db/redis/redis.js';
import { loadProtos } from './loadProtos.js';

const InitServer = async () => {
  try {
    await loadProtos();
    await initOnRedis();
  } catch (err) {
    console.error(err);
  }
};

export default InitServer;
