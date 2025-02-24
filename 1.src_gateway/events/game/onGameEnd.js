import { userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

const onGameEnd = (socket) => () => {
  console.log('[게임 서버] 연결이 종료되었습니다.');

  // 진짜 종료 시켜주기
  socket.end();
  socket.destroy();
};

export default onGameEnd;
