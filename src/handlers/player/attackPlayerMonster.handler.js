import makePacket from '../../utils/packet/makePacket.js';
import { roomSession, userSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';

const attackPlayerMonsterHandler = ({ socket, payload }) => {
  const { playerDirX, playerDirY, monsterId } = payload;

  console.log('몬스터 데미지 실행');

  // 유저 객체 조회
  const user = userSession.getUser(socket.id);
  if (!user) {
    throw new CustomError('유저 정보가 없습니다.');
  }

  // RoomId 조회
  const roomId = user.getRoomId();
  if (!roomId) {
    throw new CustomError(`User(${user.id}): RoomId 가 없습니다.`);
  }

  // 룸 객체 조회
  const room = roomSession.getRoom(roomId);
  if (!room) {
    throw new CustomError(`Room ID(${roomId}): Room 정보가 없습니다.`);
  }

  // 게임 객체(세션) 조회
  const game = room.getGame();
  if (!game) {
    throw new CustomError(`Room ID(${roomId}): Game 정보가 없습니다.`);
  }

  // 플레이어 객체 조회
  const player = game.getPlayerById(user.id);
  if (!player) {
    throw new CustomError(`Room ID(${roomId})-User(${user.id}): Player 정보가 없습니다.`);
  }

  // Notification - 다른 플레이어들에게 전달
  const motionPayload = { playerId: user.id, playerDirX, playerDirY };
  let packet = makePacket(config.packetType.S_PLAYER_ATTACK_NOTIFICATION, motionPayload);
  game.notification(socket, packet);

  // 몬스터 조회
  const monster = game.getMonsterById(monsterId);
  if (!monster) {
    throw new CustomError(`Monster ID : ${monsterId}는 존재하지 않습니다.`);
  }

  // 몬스터 HP 차감 처리
  const damage = player.getPlayerAtkDamage();
  let currHp = monster.setDamaged(damage);

  if (currHp <= 0) {
    // 몬스터 사망 처리
    game.removeMonster(monsterId);

    // 몬스터 사망 알림
    packet = makePacket(config.packetType.S_MONSTER_DEATH_NOTIFICATION, {
      monsterId,
    });
    game.broadcast(packet);

    // 아이템 드롭 처리
    // 기존 아이템 드롭 처리 주석
    /*
    const monsterPosition = monster.getMonsterPos();
    const droppedItems = game.itemManager.createDropItems(monster.grade, monsterPosition);
    
    if (droppedItems.length > 0) {
      // 아이템 생성 알림
      packet = makePacket(config.packetType.S_ITEM_SPAWN_NOTIFICATION, {
        items: droppedItems,
      });
      game.broadcast(packet);
    }
    */

    // 테스트용 코드: 아이템을 바로 플레이어 인벤토리에 추가
    const items = game.itemManager.createDropItems(monster.grade, monster.getMonsterPos());
    if (items.length > 0) {
      items.forEach((item) => {
        // 아이템 습득 처리
        item.pickup();
        // 플레이어 인벤토리에 추가
        player.addItem(item);
      });

      // 아이템 획득 알림
      packet = makePacket(config.packetType.S_PLAYER_GET_ITEM_NOTIFICATION, {
        success: true,
        message: '아이템을 획득했습니다.',
        items: items,
      });
      socket.write(packet);
    }
  } else {
    // 몬스터 HP 업데이트 알림
    packet = makePacket(config.packetType.S_MONSTER_HP_UPDATE_NOTIFICATION, {
      monsterId,
      hp: currHp,
    });
    game.broadcast(packet);
  }

  // TODO : 검증 로직은 일단 주석 처리
  // 몬스터 목록 조회
  // const monsterList = game.getAllMonster();
  //
  // // 몬스터 리스트 순회
  // monsterList.forEach((monster) => {
  //   // 몬스터 정보 조회
  //   const { id: monsterId, x: monsterX, y: monsterY } = monster.monsterDataSend();
  //
  //   //대상(몬스터)의 거리 계산
  //   const distance = calculateDistance(playerX, playerY, monsterX, monsterY);
  //
  //   // 공격 범위 내에 몬스터가 있으면
  //   if (distance <= player.getRange()) {
  //     // 각도 계산
  //     const angleToMonster = calculateAngle(
  //       playerX,
  //       playerY,
  //       playerDirX,
  //       playerDirY,
  //       monsterX,
  //       monsterY,
  //     );
  //
  //     // 공격 각도 내에 몬스터가 있으면
  //     if (angleToMonster <= player.getAngle() / 2) {
  //       // TODO : 테스트 로그
  //       console.log(`MONSTER ID: ${monster.getMonsterId()} (${monsterX}, ${monsterY}) ATTACK`);
  //
  //       // 몬스터 HP 차감 처리
  //       const damege = player.getPlayerAtkDamage();
  //       const currHp = monster.setDamaged(damege);
  //
  //       if (currHp <= 0) {
  //         // 몬스터 사망 처리
  //         game.removeMonster(monsterId);
  //       }
  //
  //       // 패킷 생성
  //       const packet = makePacket(PACKET_TYPE.MONSTER_HP_UPDATE_NOTIFICATION, {
  //         monsterId,
  //         damege,
  //       });
  //
  //       // broadcast - 모든 플레이어들에게 전달
  //       game.broadcast(packet);
  //     } else {
  //       // TODO : 테스트 로그
  //       console.log(`MONSTER ID: ${monster.getMonsterId()} (${monsterX}, ${monsterY}) ANGLE OUT`);
  //     }
  //   } else {
  //     // TODO : 테스트 로그
  //     console.log(`MONSTER ID: ${monster.getMonsterId()} (${monsterX}, ${monsterY}) RANGE OUT`);
  //   }
  // });
};

export default attackPlayerMonsterHandler;
