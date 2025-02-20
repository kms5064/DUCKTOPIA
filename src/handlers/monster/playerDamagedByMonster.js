import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import CustomError from '../../utils/error/customError.js';
import logger from '../../utils/winstonSetting.js';

//실질적으로 몬스터의 데미지가 들어가는 핸들러
const playerDamagedByMonsterHandler = async ({ socket, payload }) => {
  try {
    const { playerId, monsterId } = payload;

    const user = userSession.getUser(socket.id);
    const game = roomSession.getRoom(user.getRoomId()).getGame();
    const monster = game.getMonsterById(monsterId);
    const player = game.getPlayerById(playerId);

    let packet;
    let monsterAttackPayload;

    const remainPlayerHp = player.changePlayerHp(monster.getAttack());
    //몬스터가 플레이어를 때렸을 때 [3] : 충격 처리
    if (remainPlayerHp <= 0) {
      //유저 사망 처리 먼저 하도록 하자.
      //플레이어가 살아날 위치를 지정해준다.
      console.log('플레이어 사망');
      const deadPayload = { playerId: playerId };
      packet = makePacket(config.packetType.S_PLAYER_DEATH_NOTIFICATION, deadPayload);
    } else {
      //동기화 패킷은 계속 보내지고 있을 터이니 그 쪽에서 처리하면 될 테고

      monsterAttackPayload = { playerId: playerId, hp: player.hp };
      packet = makePacket(config.packetType.S_PLAYER_HP_UPDATE_NOTIFICATION, monsterAttackPayload);
    }

    game.broadcast(packet);
  }
  catch (err) {
    logger.error("에러 발생!", { error: new Error(err) });
  }

};

export default playerDamagedByMonsterHandler;
