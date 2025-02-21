import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import CustomError from '../../utils/error/customError.js';
import { DayPhase } from '../../config/constants/game.js';

const gameStartHandler = ({ socket, payload }) => {
  const { monsters, objects } = payload; //좌표가 objects에 들어있고 그걸 서버에 저장

  const user = userSession.getUser(socket.id);
  const room = roomSession.getRoom(user.roomId);

  if (!room) {
    throw new CustomError('방 생성에 실패했습니다!');
  }

  const game = room.getGame();
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
    game.getMonsterById(monster.monsterId).setStartPosition(monster.x, monster.y);
    game.getMonsterById(monster.monsterId).setPosition(monster.x, monster.y);
  });

  // 오브젝트 위치 조정
  game.setObjectPositions(objects);

  const GameStartNotification = makePacket(config.packetType.START_GAME_NOTIFICATION, {
    gameState: { phaseType: 0, nextPhaseAt: config.game.phaseCount[DayPhase.DAY] + Date.now() }, //이삭님 코드에 이렇게돼있음!
    playerPositions: room.getUsersPositionData(),
    monsters: monsters,
    objects: objects,
  });

  room.startGame();
  room.broadcast(GameStartNotification);
};

export default gameStartHandler;
