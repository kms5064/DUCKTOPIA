import { userSession } from "../sessions/session.js";

const onEnd = (socket) => () => {
  console.log('클라이언트 연결이 종료되었습니다.');

  // 세션에서 제거
  userSession.deleteEmail(socket);
  userSession.deleteUser(socket);

  // 진짜 종료 시켜주기
  socket.end();
  socket.destroy();
};

export default onEnd;
