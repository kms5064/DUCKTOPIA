import makeServerPacket from '../../utils/packet/makeServerPacket.js';

const onGameServerHandler = ({ socket, payload }) => {
  // 유저 객체 조회
  const user = userSession.getUser(socket.id);
  if (!user || !user.id) {
    throw new CustomError('유저 정보가 없습니다.');
  }

  if (!user.getGameState()) {
    throw new CustomError(`올바르지 못한 요청입니다. (USER ID: ${user.id})`);
  }

  const packetInfo = Object.values(config.packetType).find(([type, name]) => type === packetType);
  // payload 디코딩이 된거고
  // makeServerPacket 인코딩
  const packet = makeServerPacket(packetInfo, payload, user.id);

  const gameSocket = serverSession.getServerById(config.server.gameServer);
  gameSocket.write(packet);
};

export default onGameServerHandler;
