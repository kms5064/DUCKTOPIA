import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';

//몬스터 공격 모션 동기화 작업
//몬스터의 동기화를
const MonsterAttackHandler = async ({ socket, payload, userId }) => {
  //몬스터가 플레이어를 때렸을 때 [1] : 우선 몬스터의 정보를 가져온다.

  const user = userSession.getUser(userId);
  if (!user) throw new CustomError(`User ID : (${userId}): 유저 정보가 없습니다.`);

  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError('게임 생성에 실패했습니다!');
  //몬스터가 플레이어를 때렸을 때 [2] : 같은 아이디를 가진 플레이어와 몬스터를 세션에서 찾는다.

  const packet = [config.packetType.S_MONSTER_ATTACK_NOTIFICATION, payload];
  game.notification(userId, packet);
};

export default MonsterAttackHandler;
