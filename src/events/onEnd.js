import { roomSession, userSession } from '../sessions/session.js';
import CustomError from '../utils/error/customError.js';
import { config } from '../config/config.js';
import makePacket from '../utils/packet/makePacket.js';

const onEnd = (socket) => () => {
  console.log('클라이언트 연결이 종료되었습니다.');

  // 1. 게임 내에 있으면 제거
  const user = userSession.getUser(socket.id);
  if (!user) throw new CustomError('유저가 없습니다!');

  if (user.roomId) {
    const room = roomSession.getRoom(user.roomId);
    if (!room) throw new CustomError('유저가 속한 방이 없습니다!');

    if (room.ownerId === user.id) {
      // 유저가 방장일 때
      roomSession.removeRoom(room);
    } else {
      room.removeUser(user);

      const leaveRoomNotification = makePacket(config.packetType.LEAVE_ROOM_NOTIFICATION, {
        user: user.getUserData(),
      });

      room.notification(socket, leaveRoomNotification);
    }
  }

  // 2. 방장이면 방 폭파

  // 세션에서 제거
  userSession.deleteUser(socket.id);

  // 진짜 종료 시켜주기
  socket.end();
  socket.destroy();
};

export default onEnd;
