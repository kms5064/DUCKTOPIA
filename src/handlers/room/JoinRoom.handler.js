import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import { PACKET_TYPE } from '../../config/constants/header.js';
import { roomNameSchema } from '../../utils/validations/room.validation.js';

// 방 생성 핸들러
const JoinRoomHandler = async ({socket, payload}) => {
  try {
    const { roomId } = payload;

    // 2. 유저 찾기
    const user = userSession.getUser(socket);

    // 3. 방 만들기
    const room = roomSession.getRoom(roomId);

    if (!room) {
      throw new Error('방 생성에 실패했습니다!');
    }

    // 4. 유저 정보 병경
    user.enterRoom(room.id);

    // 5. 유저 방에 추가
    room.addUser(user);



    // 6. 패킷 전송
    const joinRoomResponse = makePacket(PACKET_TYPE.JOIN_ROOM_RESPONSE, {
      success: true,
      room: room.getRoomData(),
      message: '방에 참여했습니다!',
    });
    socket.write(joinRoomResponse);

    room.joinRoomNotification(user.id);

  } catch (error) {
    console.log(error);
  }
};

export default JoinRoomHandler;
