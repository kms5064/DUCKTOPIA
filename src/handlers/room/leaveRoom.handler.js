import { PACKET_TYPE } from '../../config/constants/header.js';
import { roomSession, userSession } from '../../sessions/session.js';
import broadcast from '../../utils/packet/broadcast.js';
import makePacket from '../../utils/packet/makePacket.js';

const leaveRoomHandler = (socket, payload) => {
  try {
    // 1. 유저 찾기
    const user = userSession.getUser(socket);

    if (!user) {
      throw new Error('유저가 읎어요!');
    }

    // 2. 유저가 속한 방 찾기
    if (user.state !== 'room') {
      throw new Error('유저가 방에 없습니다.');
    }

    if (!user.roomId) {
      throw new Error('유저가 방 id를 가지고 있지 않습니다.');
    }

    const room = roomSession.getRoom(user.roomId);

    if (!room) {
      throw new Error('유저가 속한 방이 존재하지 않습니다.');
    }

    // 3. 유저가 방장인지 확인
    const isOwner = user.id === room.ownerId;

    // 3-1. 방장이면 방 터트리기 (TODO 추후 개발)

    // 3-2. 방장이 아니면 유저 상태만 변경
    user.exitRoom();

    // 4. 방장이 아니면 방에서 유저 삭제
    room.removeUser(socket);

    // 5. response 전송
    const leaveRoomResponse = makePacket(PACKET_TYPE.LEAVE_ROOM_RESPONSE, {
      success: true,
    });

    socket.write(leaveRoomResponse);

    // 6. notification 전송
    const leaveRoomNotification = makePacket(PACKET_TYPE.LEAVE_ROOM_NOTIFICATION, {
      userId: user.id,
    });

    broadcast(room.getUsers(), leaveRoomNotification);
  } catch (error) {
    console.log(error);
  }
};

export default leaveRoomHandler;
