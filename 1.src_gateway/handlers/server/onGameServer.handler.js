import makeServerPacket from '../../utils/packet/makeServerPacket.js';
import { serverSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';
import { config } from '../../config/config.js';

const onGameServerHandler = ({ socket, payloadBuffer, packetType }) => {
  // 유저 객체 조회
  const user = userSession.getUser(socket.id);
  if (!user || !user.id) {
    throw new CustomError('유저 정보가 없습니다.');
  }
  if (!user.getGameState()) {
    throw new CustomError(`올바르지 못한 요청입니다. (USER ID: ${user.id})`);
  }

  const packetInfo = Object.values(config.packetType).find(([type, name]) => type === packetType);
  const packet = makeServerPacket(packetInfo, { payloadBuffer }, user.id);
  const gameServer = serverSession.getServerById(user.gameServer);
  gameServer.socket.write(packet);
};

export default onGameServerHandler;
