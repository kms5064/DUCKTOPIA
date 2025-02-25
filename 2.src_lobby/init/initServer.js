import { loadProtos } from './loadProtos.js';
import serverOnRedis from './serverOnRedis.js';

const InitServer = async () => {
  try {
    await loadProtos();
    await serverOnRedis();
  } catch (err) {
    console.error(err);
  }
};

export default InitServer;
