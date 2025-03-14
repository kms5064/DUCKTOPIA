import makeServerPacket from '../../utils/packet/makeServerPacket.js';
import { serverSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';
import { config } from '../../config/config.js';

const onGameServerHandler = async ({ socket, payloadBuffer, packetType }) => {
  // 유저 객체 조회
  const user = userSession.getUser(socket.id);
  if (!user || !user.id) {
    throw new CustomError('유저 정보가 없습니다.');
  }

  const game = await user.getGameState()
  if (!game) return

  const packetInfo = Object.values(config.packetType).find(([type, name]) => type === packetType);
  const packet = makeServerPacket(packetInfo, null, payloadBuffer, user.id);
  const gameServer = serverSession.getServerById(user.gameServer);
  gameServer.socket.write(packet);
};

export default onGameServerHandler;
