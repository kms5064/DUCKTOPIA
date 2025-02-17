import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import CustomError from '../../utils/error/customError.js';

const gamePrepareReqHandler = ({ socket, payload }) => {
  const user = userSession.getUser(socket.id);

  const game = gameSession.getGameById(user.getRoomId());
  if (!game) {
    throw new CustomError('게임 생성에 실패했습니다!');
  }

  // 초기 몬스터 정보 생성
  const monsterData = game.createMonsterData();

  const GamePrepareResponse = makePacket(config.packetType.PREPARE_GAME_RESPONSE, {
    success: true,
    monsters: monsterData,
    objects: [],
  });
  socket.write(GamePrepareResponse);

  // const GamePrepareNotification = makePacket(config.packetType.PREPARE_GAME_NOTIFICATION, {
  //   room: room.getRoomData(),
  // });

  // game.broadcast(GamePrepareNotification);
};

export default gamePrepareReqHandler;
