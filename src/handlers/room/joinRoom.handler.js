import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import { errorHandler } from '../../utils/error/errorHandler.js';
import makePacket from '../../utils/packet/makePacket.js';

const joinRoomHandler = ({ socket, payload }) => {
  try {
    const { roomId } = payload;

    // 1. 유저 찾기
    const user = userSession.getUser(socket.id);
    if (!user) {
      throw new Error('유저를 찾지 못했습니다.');
    }

    // 2. 방 찾기
    const room = roomSession.getRoom(roomId);
    if (!room) {
      throw new Error('유효하지 않은 roomId입니다.');
    }

    // 3. 방 인원 추가
    const result = room.addUser(user);
    if (!result) {
      throw new Error('방 정원이 다 찼습니다.');
    }

    // 5. response 전송
    const joinRoomResponse = makePacket(config.packetType.JOIN_ROOM_RESPONSE, {
      success: true,
      room: room.getRoomData(),
    });

    socket.write(joinRoomResponse);

    // 6. notification 전송
    const joinRoomNotification = makePacket(config.packetType.JOIN_ROOM_NOTIFICATION, {
      user: user.getUserData(),
    });

    room.notification(user.id, joinRoomNotification); // 브로드캐스트
  } catch (error) {
    errorHandler(socket, error);
  }
};

export default joinRoomHandler;
