import { userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

const onLobbyEnd = (socket) => () => {
  console.log('[로비 서버] 연결이 종료되었습니다.');

  // 진짜 종료 시켜주기
  socket.end();
  socket.destroy();
};

export default onLobbyEnd;
