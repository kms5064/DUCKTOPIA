import { gameSession, userSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';

const attackPlayerMonsterHandler = ({ socket, payload, userId }) => {
  const { playerDirX, playerDirY, monsterId } = payload;

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError('유저 정보가 없습니다.');

  const player = user.player;

  // 게임 객체(세션) 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  // Notification - 다른 플레이어들에게 전달
  const motionPayload = { playerId: userId, playerDirX, playerDirY };
  const PlayerAttackNotification = [config.packetType.S_PLAYER_ATTACK_NOTIFICATION, motionPayload];
  game.notification(userId, PlayerAttackNotification);

  // 몬스터 조회
  const monster = game.getMonsterById(monsterId);
  if (!monster) throw new CustomError(`Monster ID : ${monsterId}는 존재하지 않습니다.`);

  // 무기 공격력 계산
  let weaponAttack = 0;
  if (player.equippedWeapon !== null) {
    const equippedWeaponCode = player.equippedWeapon.itemCode;
    const equippedWeapon = game.itemManager.weaponData.find(
      (weapon) => weapon.code === equippedWeaponCode,
    );

    if (equippedWeapon) {
      weaponAttack = equippedWeapon.attack;
    }
  }

  // 방어구의 공격력 계산
  let armorAttack = 0;

  if (Object.values(player.equippedArmors).some((armor) => armor !== null)) {
    // 각 방어구 타입별로 공격력 계산
    Object.entries(player.equippedArmors).forEach(([armorType, armor]) => {
      if (armor !== null) {
        // 방어구 데이터 조회
        let armorData;

        // 방어구 타입에 따라 다른 데이터 소스에서 조회
        switch (armorType) {
          case 'helmet':
            armorData = game.itemManager.armorHelmetData?.find(
              (item) => item.code === armor.itemCode,
            );
            break;
          case 'top':
            armorData = game.itemManager.armorTopData?.find((item) => item.code === armor.itemCode);
            break;
          case 'bottom':
            armorData = game.itemManager.armorBottomData?.find(
              (item) => item.code === armor.itemCode,
            );
            break;
          case 'shoes':
            armorData = game.itemManager.armorShoesData?.find(
              (item) => item.code === armor.itemCode,
            );
            break;
          case 'accessory':
            armorData = game.itemManager.armorAccessoryData?.find(
              (item) => item.code === armor.itemCode,
            );
            break;
        }

        // 방어구 데이터가 있고 attack 속성이 있으면 공격력에 추가
        if (armorData && armorData.attack) {
          armorAttack += armorData.attack;
        }
      }
    });
  }

  // 몬스터 HP 차감 처리 - 무기 공격력과 방어구 공격력 합산
  const totalAttack = weaponAttack + armorAttack;
  const damage = player.getPlayerAtkDamage(totalAttack);
  // console.log('[Player Attack] 플레이어 공격력:', damage);
  // console.log('[무기 공격력]:', weaponAttack);
  // console.log('[방어구 공격력]:', armorAttack);

  const currHp = monster.setDamaged(damage, game);

  // 패킷 생성 - 몬스터 HP 업데이트
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

  // 몬스터 사망 알림
  const MonsterDeathNotification = [
    config.packetType.S_MONSTER_DEATH_NOTIFICATION,
    {
      monsterId,
    },
  ];
  game.broadcast(MonsterDeathNotification);

  const monsterPosition = monster.getMonsterPos();
  const droppedItems = game.itemManager.createDropItems(monster.grade, monsterPosition);

  if (droppedItems.length <= 0) {
    // console.log('[아이템 미생성] 드롭 확률에 실패하여 아이템이 생성되지 않음');
    return;
  }

  // 아이템 생성 알림
  const itemSpawnNotification = [
    config.packetType.S_ITEM_SPAWN_NOTIFICATION,
    {
      items: droppedItems,
    },
  ];
  // console.log('[패킷 전송] S_ITEM_SPAWN_NOTIFICATION 전송');
  game.broadcast(itemSpawnNotification);
};

export default attackPlayerMonsterHandler;
