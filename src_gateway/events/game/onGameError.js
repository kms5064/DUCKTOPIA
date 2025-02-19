import { userSession } from '../../sessions/session.js';

const onGameError = (socket) => (err) => {
  console.error('소켓 오류:', err);
  console.log('[개임 서버] 연결이 종료되었습니다.');

  // 진짜 종료 시켜주기
  socket.end();
  socket.destroy();
};

export default onGameError;
