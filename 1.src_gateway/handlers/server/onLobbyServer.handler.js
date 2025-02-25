import { config } from '../../config/config.js';
import { serverSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';
import makeServerPacket from '../../utils/packet/makeServerPacket.js';

const onLobbyServerHandler = ({ socket, payload, packetType }) => {
  // 유저 객체 조회
  const user = userSession.getUser(socket.id);
  if (!user || !user.id) {
    throw new CustomError('유저 정보가 없습니다.');
  }

  if (user.getGameState()) {
    throw new CustomError(`올바르지 못한 요청입니다. (USER ID: ${user.id})`);
  }

  const packetInfo = Object.values(config.packetType).find(([type, name]) => type === packetType);
  const packet = makeServerPacket(packetInfo, payload, user.id);
  const lobbyServer = serverSession.getServerById(config.server.lobbyServer);
  lobbyServer.socket.write(packet);
};

export default onLobbyServerHandler;
