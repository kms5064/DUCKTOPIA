import { gameSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import { PACKET_TYPE } from '../../config/constants/header.js';
import CustomError from '../../utils/error/customError.js';
import { config } from '../../config/config.js';

const spawnMonsterHandler = ({ socket, payload }) => {
  // 유저 객체 조회
  const user = userSession.getUser(socket);
  if (!user) {
    throw new Error('유저 정보가 없습니다.');
  }

  // 게임 객체(세션) 조회
  const game = gameSession.getGameById(user.getRoomId());
  if (!game) {
    throw new Error(`Room ID(${roomId}): Game 정보가 없습니다.`);
  }

  payload.forEach((monster) => {
    if (!game.checkSpawnArea(monster.monsterCode, monster.x, monster.y)) {
      throw new CustomError(
        `Monster ID: ${monster.monsterId} Monster Code : ${monster.monsterCode} 의 생성 구역이 적합하지 않습니다. (${monster.x},${monster.y})`,
      );
    }
    // 몬스터 위치 적용
    game.getMonsterById(monster.monsterId).setPosition(monster.x, monster.y);
  });

  // TODO : NOTI용 패킷 추가 해야함.
  const packet = makePacket(config.packetType.S_MONSTER_SPAWN_NOTIFICATION, payload);
  game.broadcast(packet);
};

export default spawnMonsterHandler;
