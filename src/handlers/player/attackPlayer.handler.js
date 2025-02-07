import { calculateDistance, calculateAngle } from '../../utils/calculate.js';

const attackPlayerHandler = ({socket, payload}) => {
  const { x: playerDirX, y: playerDirY } = payload;

  // 유저 객체 조회
  const user = getUserBySocket(socket);
  if (!user) {
    throw new Error('user does not exist');
  }

  // 게임 ID 조회
  const gameId = user.getGameId();
  // 게임 객체(세션) 조회
  const game = getGameById(gameId);
  if (!game) {
    throw new Error('game does not exist');
  }

  // Notification - 다른 플레이어들에게 전달
  const motionPayload = { userId: user.id };
  // TODO : PARAM 체크
  const packet = createResponse(PACKET_TYPE.PLAYER_ATTACK, motionPayload);
  game.notification(socket, packet);

  // 플레이어 객체 조회
  const player = game.getPlayerById(user.userId);
  // 플레이어 위치 조회
  const { x: playerX, y: playerY } = player.getPlayerPos();

  // 몬스터 목록 조회
  const monsterList = game.getMonsterList(gameId);

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
        const currHp = monster.setDamaged(player.getPlayerAtkDamage());

        let payloadData = {};
        let packetType;
        if (currHp <= 0) {
          // 몬스터 사망 broadCast
          // 몬스터 삭제 처리
          game.removeMonster(monsterId);

          packetType = PACKET_TYPE.DEATH_MONSTER;
          payloadData = {
            monsterId,
          };
        } else {
          // 몬스터 체력 차감 broadCast
          packetType = PACKET_TYPE.DEATH_MONSTER;
          payloadData = {
            monsterId,
            monsterHp: currHp,
          };
        }

        const packet = createResponse(packetType, payloadData);

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
