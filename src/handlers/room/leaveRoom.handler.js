import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';

const leaveRoomHandler = ({ socket, payload }) => {
  try {
    // 1. 유저 찾기
    const user = userSession.getUser(socket);
    if (!user) {
      throw new Error('유저가 읎어요!');
    }

    // 2. 유저가 속한 방 찾기
    if (user.state !== 'room' || !user.roomId) {
      throw new Error('유저가 방에 없습니다.');
    }

    const room = roomSession.getRoom(user.roomId);
    if (!room) {
      throw new Error('유저가 속한 방이 존재하지 않습니다.');
    }

    // 3. 유저가 방장인지 확인
    const isOwner = user.id === room.ownerId;
    // 3-1. 방장이면 방 터트리기 (TODO 추후 개발)

    if (!isOwner) {
      // 4. 방장이 아니면 방에서 유저 삭제
      room.removeUser(user);

      // 5. response 전송
      const leaveRoomResponse = makePacket(config.packetType.LEAVE_ROOM_RESPONSE, {
        success: true,
      });

      socket.write(leaveRoomResponse);
      // 6. notification 전송
      const leaveRoomNotification = makePacket(config.packetType.LEAVE_ROOM_NOTIFICATION, {
        user: user.getUserData(),
      });

      room.notification(socket, leaveRoomNotification);
    } else {
      roomSession.removeRoom(room);
    }
  } catch (error) {
    console.log(error);
  }
};

export default leaveRoomHandler;
