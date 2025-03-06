import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

//실질적으로 몬스터의 데미지가 들어가는 핸들러
const playerDamagedByMonsterHandler = async ({ socket, payload, userId }) => {
  const { playerId, monsterId } = payload;

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError('유저 정보가 없습니다.');

  const player = user.player;

  // 룸 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  // 몬스터 조회
  const monster = game.getMonsterById(monsterId);
  if (!monster) throw new CustomError(`Monster ID : ${monsterId}는 존재하지 않습니다.`);

  const remainPlayerHp = player.changePlayerHp(monster.getAttack(), game);
  if(remainPlayerHp <= 0) return

  const packet = [config.packetType.S_PLAYER_HP_UPDATE_NOTIFICATION, { playerId: userId, hp: remainPlayerHp }];

  game.broadcast(packet);
};

export default playerDamagedByMonsterHandler;
