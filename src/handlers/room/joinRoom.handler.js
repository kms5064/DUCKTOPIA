import { PACKET_TYPE } from '../../config/constants/header.js';
import { roomSession } from '../../sessions/session.js';
import broadcast from '../../utils/packet/broadcast.js';
import makePacket from '../../utils/packet/makePacket.js';

const joinRoomHandler = ({socket, payload}) => {
  try {
    const { roomId } = payload;

    // 1. 유저 찾기
    const user = roomSession.getUser(socket);

    if (!user) {
      throw new Error('유저를 찾지 못했습니다.');
    }

    // 2. 방 찾기
    const room = roomSession.getRoom(room);

    if (!room) {
      throw new Error('유효하지 않은 roomId입니다.');
    }

    // 3. 방 인원 추가
    const result = room.addUser(socket);

    if (!result) {
      throw new Error('방 정원이 다 찼습니다.');
    }

    // 4. 유저 정보 추가
    user.enterRoom(roomId);

    // 5. response 전송
    const joinRoomResponse = makePacket(PACKET_TYPE.JOIN_ROOM_RESPONSE, {
      success: true,
      room: room.getRoomData(),
      message: '방에 참가했습니다!',
    });

    socket.write(joinRoomResponse);

    // 6. notification 전송
    const joinRoomNotification = makePacket(PACKET_TYPE.JOIN_ROOM_NOTIFICATION, {
      joinUser: user.getUserData(), // TODO 유저 데이터 받는 함수 연동
    });

    // 당사자 제외하고 보내기
    const targetUsers = room.getUsers().map((user) => user.socket !== socket);

    broadcast(targetUsers, joinRoomNotification); // 브로드캐스트
  } catch (error) {
    console.log(error);
  }
};

export default joinRoomHandler;
