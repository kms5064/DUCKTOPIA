import { userSession } from '../sessions/session.js';
import CustomError from '../utils/error/customError.js';

const onEnd = (socket) => () => {
  console.log('클라이언트 연결이 종료되었습니다.');

  // 1. 게임 내에 있으면 제거
  const user = userSession.getUser(socket.id);
  if (!user) throw new CustomError('유저가 없습니다!');

  // 세션에서 제거
  userSession.deleteUser(socket.id);

  // 진짜 종료 시켜주기
  socket.end();
  socket.destroy();
};

export default onEnd;
