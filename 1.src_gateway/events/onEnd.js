import { config } from '../config/config.js';
import { userSession } from '../sessions/session.js';
import CustomError from '../utils/error/customError.js';
import makePacket from '../utils/packet/makePacket.js';

const onEnd = (socket) => async () => {
  // console.log('클라이언트 연결이 종료되었습니다.');

  const user = userSession.getUser(socket.id);
  if (!user) return
  // 세션에서 제거
  await userSession.deleteUser(socket.id);

  const packet = makePacket(config.packetType.S_GET_OUT, {})
  socket.write(packet);

  // 진짜 종료 시켜주기
  socket.end();
  socket.destroy();
};

export default onEnd;
