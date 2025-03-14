import { loadProtos } from './loadProtos.js';
import serverOnRedis from './serverOnRedis.js';

const InitServer = async () => {
  try {
    await loadProtos();
    // Redis에 저장된 서버에 연결
    await serverOnRedis();
  } catch (err) {
    console.error(err);
  }
};

export default InitServer;
