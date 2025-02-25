import { loadProtos } from './loadProtos.js';
import initOnRedis from './serverOnRedis.js';

const InitServer = async () => {
  try {
    await loadProtos();
    await initOnRedis();
    // Redis에 저장된 서버에 연결
  } catch (err) {
    console.error(err);
  }
};

export default InitServer;
