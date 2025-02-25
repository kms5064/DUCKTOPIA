import { loadGameAssets } from './assets.js';
import { loadProtos } from './loadProtos.js';
import serverOnRedis from './serverOnRedis.js';

const InitServer = async () => {
  try {
    await loadGameAssets();
    await loadProtos();
    await serverOnRedis();
  } catch (err) {
    console.error(err);
  }
};

export default InitServer;
