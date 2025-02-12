import { roomSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket';
import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';

//이건 몬스터가 공격했을 때 어떤 식의 반응이 있을 것인지 테스트하기
export const AttackByPlayerHandler = async (socket, payload) => {
  try {
    //몬스터가 플레이어를 때렸을 때 [1] : 우선 몬스터의 정보를 가져온다.
    const { monsterId, targetId } = payload;

    //몬스터가 플레이어를 때렸을 때 [2] : 같은 아이디를 가진 플레이어와 몬스터를 세션에서 찾는다.
    const game = roomSession.findGameBySocket(socket);

    if (!game) {
      throw new CustomError('게임을 찾을 수 없습니다.');
    }
    const player = game.getPlayerBySocket(socket);

    if (!player || player.id !== targetId) {
      throw new CustomError('플레이어를 찾을 수 없습니다.');
    }

    const monster = game.getMonster(monsterId);

    //별개 : 해당 플레이어만 가지고 있던 몬스터가 있다면 동기화가 잘못된 것이므로 일단 오류 처리
    if (!monster) {
      //몬스터가 죽었다는 것을 별도로 보내주고 끝내도록 하자.
      const alreadMonsterDead = {
        monsterId: monsterId,
      };

      const monsterDeadPacket = makePacket(
        config.packetType.S_MONSTER_DEATH_NOTIFICATION,
        alreadMonsterDead,
      );
      player.socket.write(monsterDeadPacket);
      return;
    }

    let packet;
    let monsterAttackPayload;

    const remainPlayerHp = user.changePlayerHp(monster.getAttack());
    //몬스터가 플레이어를 때렸을 때 [3] : 충격 처리
    if (remainPlayerHp <= 0) {
      //유저 사망 처리 먼저 하도록 하자.
      player.isDead();
      //플레이어가 살아날 위치를 지정해준다.

      const deadPayload = { playerId: player.id };
      packet = makePacket(config.packetType.S_PLAYER_DEATH_NOTIFICATION, deadPayload);
    } else {
      //동기화 패킷은 계속 보내지고 있을 터이니 그 쪽에서 처리하면 될 테고
      monsterAttackPayload = { playerId: player.id, hp: player.hp };
      packet = makePacket(config.packetType.S_MONSTER_ATTACK_NOTIFICATION, monsterAttackPayload);
    }

    game.broadcastAllPlayer(packet, [socket]);

    //몬스터가 플레이어를 때렸을 때 [4] : 동기화 처리
  } catch (err) {
    switch (err) {
      case 'game fail':
        break;
      case 'player fail':
        break;
    }
  }
};
