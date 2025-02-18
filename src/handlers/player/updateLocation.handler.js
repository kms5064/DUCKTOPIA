import makePacket from '../../utils/packet/makePacket.js';
import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

const updateLocationHandler = ({ socket, payload }) => {
  const { x, y } = payload;

  const user = userSession.getUser(socket.id);
  const room = roomSession.getRoom(user.roomId);
  if (!room) {
    throw new CustomError('방 생성에 실패했습니다!');
  }

  const player = room.game.getPlayerById(user.id);
  const updatePositionNotification = player.calculatePosition(x, y);
  // payload 인코딩
  const notification = makePacket(config.packetType.S_PLAYER_POSITION_UPDATE_NOTIFICATION, {
    playerPositions: [updatePositionNotification],
  });

  // 룸 내 인원에게 브로드캐스트
  room.broadcast(notification);
};

export default updateLocationHandler;
