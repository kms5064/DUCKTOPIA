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

  const game = room.getGame();
  if (!game) {
    throw new CustomError('게임 생성에 실패했습니다!');
  }

  // 초기 몬스터 정보 생성
  const monsterData = game.createMonsterData();

  //초기 오브젝트 정보 생성
  const objectData = game.createObjectData();

 
  const GamePrepareResponse = makePacket(config.packetType.PREPARE_GAME_RESPONSE, {
    success: true,
    monsters: monsterData,
    objectsPositionData:  objectData,
  });

  socket.write(GamePrepareResponse);
  

  const GamePrepareNotification = makePacket(config.packetType.PREPARE_GAME_NOTIFICATION, {
    room: room.getRoomData(),
  });

  room.broadcast(GamePrepareNotification);
};

export default gamePrepareReqHandler;
