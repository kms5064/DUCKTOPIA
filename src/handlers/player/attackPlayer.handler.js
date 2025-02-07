import { calculateDistance, calculateAngle } from '../../utils/calculate.js';
import { PACKET_TYPE } from '../../config/constants/header.js';
import makePacket from '../../utils/packet/makePacket.js';
import { userSession } from '../../sessions/session.js';

const attackPlayerHandler = ({ socket, payload }) => {
  const { x: playerDirX, y: playerDirY } = payload;

  // 유저 객체 조회
  const user = userSession.getUser(socket);
  if (!user) {
    throw new Error('user does not exist');
  }

  // TODO : 현재 게임 세션을 찾을 방법이 없음...
  // 게임 객체(세션) 조회
  const game = getGameById(gameId);
  if (!game) {
    throw new Error('game does not exist');
  }

  // Notification - 다른 플레이어들에게 전달
  const motionPayload = { playerId: player.id };
  const packet = makePacket(PACKET_TYPE.PLAYER_ATTACK_NOTIFICATION, motionPayload);
  game.notification(socket, packet);

  // TODO : 여기도 아직 미구현
  // 플레이어 객체 조회
  const player = game.getPlayer(playerId);
  // 플레이어 위치 조회
  const { x: playerX, y: playerY } = player.getPlayerPos();

  // 몬스터 목록 조회
  const monsterList = game.getAllMonster();

  monsterList.forEach((monster) => {
    // 몬스터 정보 조회
    const { id: monsterId, hp: monsterHp, x: monsterX, y: monsterY } = monster.monsterDataSend();

    //대상(몬스터)의 거리 계산
    const distance = calculateDistance(playerX, playerY, monsterX, monsterY);

    // 공격 범위 내에 몬스터가 있으면
    if (distance <= player.getRange()) {
      // 각도 계산
      const angleToMonster = calculateAngle(
        playerX,
        playerY,
        playerDirX,
        playerDirY,
        monsterX,
        monsterY,
      );

      // 공격 각도 내에 몬스터가 있으면
      if (angleToMonster <= player.getAngle() / 2) {
        // TODO : 테스트 로그
        console.log(`MONSTER ID: ${monster.getMonsterId()} (${monsterX}, ${monsterY}) ATTACK`);

        // 몬스터 HP 차감 처리
        const damege = player.getPlayerAtkDamage();
        const currHp = monster.setDamaged(damege);

        if (currHp <= 0) {
          // 몬스터 사망 처리
          game.removeMonster(monsterId);
        }

        // 페이로드
        const resPayload = {
          monsterId,
          damege,
        };

        const packet = makePacket(PACKET_TYPE.MONSTER_HP_UPDATE_NOTIFICATION, resPayload);
        // broadcast - 모든 플레이어들에게 전달
        game.broadcast(packet);
      } else {
        // TODO : 테스트 로그
        console.log(`MONSTER ID: ${monster.getMonsterId()} (${monsterX}, ${monsterY}) ANGLE OUT`);
      }
    } else {
      // TODO : 테스트 로그
      console.log(`MONSTER ID: ${monster.getMonsterId()} (${monsterX}, ${monsterY}) RANGE OUT`);
    }
  });
};

export default attackPlayerHandler;
