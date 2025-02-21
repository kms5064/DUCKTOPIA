import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

//실질적으로 몬스터의 데미지가 들어가는 핸들러
const playerDamagedByMonsterHandler = async ({ socket, payload, userId }) => {
  const { playerId, monsterId } = payload;

  const user = userSession.getUser(userId);
  if (!user) throw new CustomError(`User ID : (${userId}): 유저 정보가 없습니다.`);

  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  const monster = game.getMonsterById(monsterId);
  if (!monster) throw new CustomError(`Monster ID : ${monsterId}는 존재하지 않습니다.`);

  let packet;
  const remainPlayerHp = user.player.changePlayerHp(monster.getAttack());
  //몬스터가 플레이어를 때렸을 때 [3] : 충격 처리

  console.log(playerId, '현재 체력: ', remainPlayerHp);
  if (remainPlayerHp <= 0) {
    //플레이어가 살아날 위치를 지정해준다.
    console.log(`플레이어 사망 : USER ID(${playerId})`);
    packet = [config.packetType.S_PLAYER_DEATH_NOTIFICATION, { playerId: playerId }];
  } else {
    //동기화 패킷은 계속 보내지고 있을 터이니 그 쪽에서 처리하면 될 테고

    packet = [
      config.packetType.S_PLAYER_HP_UPDATE_NOTIFICATION,
      { playerId: playerId, hp: user.player.hp },
    ];
  }

  // game.broadcast(packet);
};

export default playerDamagedByMonsterHandler;
