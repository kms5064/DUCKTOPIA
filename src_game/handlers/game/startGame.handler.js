import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import CustomError from '../../utils/error/customError.js';

const gameStartHandler = ({ socket, payload }) => {
  const { monsters, objects } = payload;

  const user = userSession.getUser(socket.id);

  const game = gameSession.getGameById(user.getRoomId());
  if (!game) {
    throw new CustomError('게임 생성에 실패했습니다!');
  }

  monsters.forEach((monster) => {
    // 생성 구역 체크
    // if (!game.checkSpawnArea(monster.monsterCode, monster.x, monster.y)) {
    //   throw new CustomError(
    //     `Monster ID: ${monster.monsterId} Monster Code : ${monster.monsterCode} 의 생성 구역이 적합하지 않습니다. (${monster.x},${monster.y})`,
    //   );
    // }
    // 몬스터 : 클라에서 생성된 좌표 값으로 변경
    game.getMonsterById(monster.monsterId).setPosition(monster.x, monster.y);
  });

  const GameStartNotification = makePacket(config.packetType.START_GAME_NOTIFICATION, {
    gameState: { phaseType: 0, nextPhaseAt: 100000 }, //이삭님 코드에 이렇게돼있음!
    // playerPositions: game.getUsersPositionData(),
    monsters: monsters,
    objects: objects,
  });

  game.broadcast(GameStartNotification);
};

export default gameStartHandler;
