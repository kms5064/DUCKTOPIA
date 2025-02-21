import makePacket from '../../utils/packet/makePacket.js';
import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';

//몬스터 공격 모션 동기화 작업
//몬스터의 동기화를
const MonsterAttackHandler = async ({ socket, payload }) => {
  //몬스터가 플레이어를 때렸을 때 [1] : 우선 몬스터의 정보를 가져온다.

  const user = userSession.getUser(socket.id);
  const game = roomSession.getRoom(user.getRoomId()).getGame();
  //몬스터가 플레이어를 때렸을 때 [2] : 같은 아이디를 가진 플레이어와 몬스터를 세션에서 찾는다.

  const packet = makePacket(config.packetType.S_MONSTER_ATTACK_NOTIFICATION, payload);
  game.notification(socket, packet);
};

export default MonsterAttackHandler;
