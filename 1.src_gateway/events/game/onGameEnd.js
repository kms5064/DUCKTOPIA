import { config } from 'dotenv';
import { redisClient } from '../../db/redis/redis.js';
import { serverSession } from '../../sessions/session.js';

const onGameEnd = (socket) => async () => {
  console.log('[게임 서버] 연결이 종료되었습니다.');
  serverSession.deleteServer(socket.id);

  //await redisClient.publish(config.redis.custom + "ServerOff", socket.id);

  // 진짜 종료 시켜주기
  socket.end();
  socket.destroy();
};

export default onGameEnd;
