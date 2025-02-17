import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import CustomError from '../../utils/error/customError.js';

const gamePrepareReqHandler = ({ socket, payload }) => {
  const user = userSession.getUser(socket.id);
  const room = roomSession.getRoom(user.roomId);
  if (!room) {
    throw new Error('방 생성에 실패했습니다!');
  }

  // TODO : 레디스에 게임 정보를 저장하고 그 키 값과 게임서버 URL을 클라로 전송.

  // 초기 몬스터 정보 생성
  // const monsterData = game.createMonsterData();

  const GamePrepareResponse = makePacket(config.packetType.PREPARE_GAME_RESPONSE, {
    success: true,
    redisKey: '',
    serverUrl: '',
  });
  socket.write(GamePrepareResponse);

  // const GamePrepareNotification = makePacket(config.packetType.PREPARE_GAME_NOTIFICATION, {
  //   room: room.getRoomData(),
  // });

  room.broadcast();
};

export default gamePrepareReqHandler;
