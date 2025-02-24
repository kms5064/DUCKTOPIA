import { gameSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import CustomError from '../../utils/error/customError.js';
import { config } from '../../config/config.js';

// 이거 지금 안쓰는데요?

const spawnMonsterHandler = ({ socket, payload, userId }) => {
  const { monsters } = payload;

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new Error('유저 정보가 없습니다.');

  // 룸 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new Error(`Room ID(${roomId}): Room 정보가 없습니다.`);

  for (const monster of monsters) {
    if (!game.checkSpawnArea(monster.monsterCode, monster.x, monster.y)) {
      throw new CustomError(
        `Monster ID: ${monster.monsterId} Monster Code : ${monster.monsterCode} 의 생성 구역이 적합하지 않습니다. (${monster.x},${monster.y})`,
      );
    }
  }

  // TODO : NOTI용 패킷 추가 해야함.
  const packet = [config.packetType.S_MONSTER_SPAWN_NOTIFICATION, payload];
  game.broadcast(packet);
};

export default spawnMonsterHandler;
