import makePacket from '../../utils/packet/makePacket.js';
import { config } from '../../config/config.js';

const updateLocationHandler = ({ socket, payload }) => {
  try {
    const { x, y } = payload;

    const user = userSession.getUser(socket);
    const room = roomSession.getRoom(user.roomId);
        if(!room) {
      throw new Error('방 생성에 실패했습니다!');
    }

    const player = room.game.getPlayerById(user.id);
    const updatePositionNotification = player.calculatePosition(x, y);
    // payload 인코딩
    const notification = makePacket(config.packetType.PLAYER_UPDATE_POSITION_NOTIFICATION, updatePositionNotification);

    // 룸 내 인원에게 브로드캐스트
    room.broadcast(notification)
  } catch (error) {
    handleError(socket, error);
  }
};

export default updateLocationHandler;
