import { PACKET_TYPE } from '../../config/constants/header.js';
import makePacket from '../../utils/packet/makePacket.js';
import { roomSession, userSession } from '../../sessions/session.js';

const attackPlayerMonsterhandler = ({ socket, payload }) => {
  const { playerDirX, playerDirY, monsterId } = payload;

  // 유저 객체 조회
  const user = userSession.getUser(socket);
  if (!user) {
    throw new Error('유저 정보가 없습니다.');
  }

  // RoomId 조회
  const roomId = user.getRoomId();
  if (!roomId) {
    throw new Error(`User(${user.id}): RoomId 가 없습니다.`);
  }

  // 룸 객체 조회
  const room = roomSession.getRoom(roomId);
  if (!room) {
    throw new Error(`Room ID(${roomId}): Room 정보가 없습니다.`);
  }

  // 게임 객체(세션) 조회
  const game = room.getGame();
  if (!game) {
    throw new Error(`Room ID(${roomId}): Game 정보가 없습니다.`);
  }

  // 플레이어 객체 조회
  const player = game.getPlayer(user.id);
  if (!player) {
    throw new Error(`Room ID(${roomId})-User(${user.id}): Player 정보가 없습니다.`);
  }

  // Notification - 다른 플레이어들에게 전달
  const motionPayload = { playerId: player.id, playerDirX, playerDirY };
  let packet = makePacket(PACKET_TYPE.PLAYER_ATTACK_NOTIFICATION, motionPayload);
  game.notification(socket, packet);

  // 몬스터 조회
  const monster = monster.getMonsterById(monsterId);
  if (!monster) {
    throw new Error(`Monster ID : ${monsterId}는 존재하지 않습니다.`);
  }

  // 몬스터 HP 차감 처리
  const damege = player.getPlayerAtkDamage();
  let currHp = monster.setDamaged(damege);

  if (currHp <= 0) {
    // 몬스터 사망 처리
    game.removeMonster(monsterId);
  }

  // 패킷 생성
  packet = makePacket(PACKET_TYPE.MONSTER_HP_UPDATE_NOTIFICATION, {
    monsterId,
    hp: currHp,
  });

  // broadcast - 모든 플레이어들에게 전달
  game.broadcast(packet);

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

export default attackPlayerMonsterhandler;
