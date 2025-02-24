import { gameSession, userSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';

const attackPlayerMonsterHandler = ({ socket, payload, userId }) => {
  const { playerDirX, playerDirY, monsterId } = payload;

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError('유저 정보가 없습니다.');

  // 룸 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  // Notification - 다른 플레이어들에게 전달
  const motionPayload = { playerId: userId, playerDirX, playerDirY };
  const PlayerAttackNotification = [config.packetType.S_PLAYER_ATTACK_NOTIFICATION, motionPayload];
  game.notification(userId, PlayerAttackNotification);

  // 몬스터 조회
  const monster = game.getMonsterById(monsterId);
  if (!monster) throw new CustomError(`Monster ID : ${monsterId}는 존재하지 않습니다.`);

  // 몬스터 HP 차감 처리
  const damage = user.player.getPlayerAtkDamage();
  const currHp = monster.setDamaged(damage);
  // 패킷 생성
  const MonsterHpUpdateNotification = [
    config.packetType.S_MONSTER_HP_UPDATE_NOTIFICATION,
    {
      monsterId,
      hp: currHp,
    },
  ];

  // broadcast - 모든 플레이어들에게 전달
  game.broadcast(MonsterHpUpdateNotification);

  if (currHp > 0) return;

  // 몬스터 사망 처리
  game.removeMonster(monsterId);

  const MonsterDeathNotification = [
    config.packetType.S_MONSTER_DEATH_NOTIFICATION,
    {
      monsterId,
    },
  ];
  game.broadcast(MonsterDeathNotification);
};

export default attackPlayerMonsterHandler;
