import { redisClient } from '../../db/redis/redis.js';
import { serverSession } from '../../sessions/session.js';

const onLobbyError = (socket) => async (err) => {
  console.error('소켓 오류:', err);
  console.log('[로비 서버] 연결이 종료되었습니다.');
  serverSession.deleteServer(socket.id);

  await redisClient.hSet(socket.id, 'status', 0);
  await redisClient.publish('ServerOff', socket.id);

  // 진짜 종료 시켜주기
  socket.end();
  socket.destroy();
};

export default onLobbyError;
