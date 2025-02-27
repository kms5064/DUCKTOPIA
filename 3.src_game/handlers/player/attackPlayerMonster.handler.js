import { gameSession, userSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';

const attackPlayerMonsterHandler = ({ socket, payload, userId }) => {
  const { playerDirX, playerDirY, monsterId } = payload;

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError('유저 정보가 없습니다.');

  const player = user.player;

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

  const equippedWeaponCode = player.equippedWeapon.itemCode;
  const equippedWeapon = game.itemManager.weaponData.find(
    (weapon) => weapon.code === equippedWeaponCode,
  );

  // 몬스터 HP 차감 처리
  const damage = user.player.getPlayerAtkDamage(equippedWeapon.attack);
  console.log('[Player Attack] 플레이어 공격력:', damage);
  console.log('[무기 공격력]');

  const currHp = monster.setDamaged(damage, game);
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
