import Joi from 'joi';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import { errorHandler } from '../../utils/error/errorHandler.js';
import { config } from '../../config/config.js';

const roomNameSchema = Joi.string().max(25).required().messages({
  'string.base': '방 이름은 문자열이어야 합니다.',
  'string.max': '방 이름을 25글자를 넘길 수 없습니다.',
  'any.required': '방 이름을 다시 입력해주세요.',
});

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
    const room = roomSession.addRoom(user.id, name, maxUserNum);
    if (!room) {
      throw new Error('방 생성에 실패했습니다!');
    }

    // 5. 유저 방에 추가
    room.addUser(user);

    // console.log(`${name} 방이 생성되었습니다.`);

    // 6. 패킷 전송
    const createRoomResponse = makePacket(config.packetType.CREATE_ROOM_RESPONSE, {
      success: true,
      room: room.getRoomData(),
      message: '방이 생성되었습니다!',
    });

    socket.write(createRoomResponse);
  } catch (error) {
     errorHandler(socket, error);
  }
};

export default createRoomHandler;
