import { serverSession } from '../../sessions/session.js';

const onLobbyEnd = (socket) => async () => {
  console.log('[로비 서버] 연결이 종료되었습니다.');
  serverSession.deleteServer(socket.id);

  // 진짜 종료 시켜주기
  socket.end();
  socket.destroy();
};

export default onLobbyEnd;
