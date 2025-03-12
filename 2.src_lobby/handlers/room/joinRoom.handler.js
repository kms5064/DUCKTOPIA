import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import CustomError from '../../utils/error/customError.js';

const joinRoomHandler = ({ socket, payload, userId }) => {
  const { roomId } = payload;

  // 1. 유저 찾기
  const user = userSession.getUser(+userId);
  if (!user || user.state !== 'lobby') {
    throw new CustomError('유저를 찾지 못했습니다.');
  }

  // 2. 방 찾기
  const room = roomSession.getRoom(roomId);
  if (!room) {
    throw new CustomError('유효하지 않은 roomId입니다.');
  }

  // 3. 방 인원 추가
  const result = room.addUser(user);
  if (!result) {
    throw new CustomError('참여가능한 방이 아닙니다!(게임 진행중/인원 초과)');
  }

    // 5. response 전송
  const joinRoomResponse = [
    config.packetType.JOIN_ROOM_RESPONSE,
    {
      success: true,
      room: room.getRoomData(),
      userId,
    },
  ];

  user.sendPacket(joinRoomResponse);

  // 6. notification 전송
  const joinRoomNotification = [
    config.packetType.JOIN_ROOM_NOTIFICATION,
    {
      user: user.getUserData(),
    },
  ];

  room.notification(user.id, joinRoomNotification); // 브로드캐스트
};

export default joinRoomHandler;
