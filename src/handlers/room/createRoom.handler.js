import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import { PACKET_TYPE } from '../../config/constants/header.js';
import { roomNameSchema } from '../../utils/validations/room.validation.js';

// 방 생성 핸들러
const createRoomHandler = async ({socket, payload}) => {
  try {
    const { name, maxUserNum } = payload;

    // 1. 방 이름 유효성 검사
    await roomNameSchema.validateAsync(name);

    // 2. 유저 찾기
    const user = userSession.getUser(socket);

    if (!user) {
      throw new Error('유저가 존재하지 않습니다!');
    }

    // 3. 방 만들기
    const room = roomSession.addRoom(user.email, name, maxUserNum);

    if (!room) {
      throw new Error('방 생성에 실패했습니다!');
    }

    // 4. 유저 정보 병경
    user.enterRoom(room.id);

    // 5. 유저 방에 추가
    room.addUser(user);

    // 6. 패킷 전송
    const createRoomResponse = makePacket(PACKET_TYPE.CREATE_ROOM_RESPONSE, {
      success: true,
      room: room.getRoomData(),
      message: '방이 생성되었습니다!',
    });

    socket.write(createRoomResponse);
  } catch (error) {
    console.log(error);
  }
};

export default createRoomHandler;
