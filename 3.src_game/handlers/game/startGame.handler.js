import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';
import { DayPhase } from '../../config/constants/game.js';

const startGameHandler = ({ socket, payload, userId }) => {
  console.log('# gameStartHandler');
  const { monsters, objects } = payload; //좌표가 objects에 들어있고 그걸 서버에 저장

  const user = userSession.getUser(userId);
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError('게임 생성에 실패했습니다!');

  monsters.forEach((monster) => {
    // 생성 구역 체크
    // if (!game.checkSpawnArea(monster.monsterCode, monster.x, monster.y)) {
    //   throw new CustomError(
    //     `Monster ID: ${monster.monsterId} Monster Code : ${monster.monsterCode} 의 생성 구역이 적합하지 않습니다. (${monster.x},${monster.y})`,
    //   );
    // }
    // 몬스터 : 클라에서 생성된 좌표 값으로 변경
    game.getMonsterById(monster.monsterId).setStartPosition(monster.x, monster.y);
  });

  const GameStartNotification = [
    config.packetType.START_GAME_NOTIFICATION,
    {
      gameState: { phaseType: 0, nextPhaseAt: config.game.phaseCount[DayPhase.DAY] + Date.now() }, //이삭님 코드에 이렇게돼있음!
      playerPositions: game.getUsersPositionData(),
      monsters: monsters,
      objects: objects,
    },
  ];

  game.startGame();
  game.broadcast(GameStartNotification);
};

export default startGameHandler;
