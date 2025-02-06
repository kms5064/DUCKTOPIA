const attackPlayerHandler = (socket, payload) => {
  // TODO : x, y 체크
  const { x, y } = payload;

  // 유저 객체 조회
  const user = getUserBySocket(socket);
  if (!user) {
    throw new Error('user does not exist');
  }

  // 게임 ID 조회
  const gameId = user.getGameId();

  // 게임 객체 조회
  const game = getGameById(gameId);
  if (!game) {
    throw new Error('game does not exist');
  }

  // Notification - 다른 플레이어들에게 전달
  game.notification(payload, socket);

  // 플레이어 객체 조회
  const player = game.getPlayerById(user.userId);

  const { x: playerX, y: playerY } = player.getPlayerPos();
  // 몬스터 목록 조회
  const monsterList = game.getMonsterList(gameId);
  monsterList.forEach((monster) => {
    const { x: monsterX, y: monsterY } = monster.getMonsterPos();

    const monsterVector = [monster.x - player.x, monster.y - player.y];

    // TODO : 몬스터 공격 핸들러 구현 시 공통적인 부분 모듈화 처리
    //대상(몬스터)의 거리 계산
    const distance = Math.sqrt(Math.pow(monsterVector[0], 2) + Math.pow(monsterVector[1], 2));
    if (distance <= player.getRange()) {
      // 2단계: 각도 범위 내에 있는지 확인 (내적 계산)
      const vectorSize = Math.sqrt(Math.pow(monsterVector[0], 2) + Math.pow(monsterVector[1], 2));

      //벡터의 정규화(단위 백터)
      const normalizedMonsterVector = [
        monsterVector[0] / vectorSize,
        monsterVector[1] / vectorSize,
      ];

      // TODO : 검증 해봐야함...
      const attackDirection = [x, y]; // 공격 방향 (예시)

      // 내적계산
      const dotProduct =
        attackDirection[0] * normalizedMonsterVector[0] +
        attackDirection[1] * normalizedMonsterVector[1];

      // Radian 변환
      const angleInDegrees = Math.acos(dotProduct) * (180 / Math.PI);

      // 180도
      if (angleInDegrees <= player.getAttackAngle() / 2) {
        //
        const monsterHp = monster.getDamge(player.getPlayerAtkDamage());

        let responsePayload = {};
        if (monsterHp <= 0) {
          // 몬스터 사망
          responsePayload = {
            id: monster.id,
          };
        } else {
          responsePayload = {
            id: monster.id,
            hp: monsterHp,
          };
        }

        // Broadcast - 모든 플레이어에게 전달
        game.broadcast(responsePayload);
      }
    }
  });
};

export default attackPlayerHandler;

// 거리 계산 함수
function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// 벡터 내적 계산 함수
function vectorDotProduct(x1, y1, x2, y2) {
  return x1 * x2 + y1 * y2;
}

// 벡터의 크기(길이) 계산 함수
function vectorLength(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

// 각도 계산 함수 (도 단위로 반환)
function calculateAngle(playerX, playerY, playerDirX, playerDirY, monsterX, monsterY) {
  // 플레이어와 몬스터의 벡터 계산
  const monsterVecX = monsterX - playerX;
  const monsterVecY = monsterY - playerY;

  // 두 벡터의 내적 계산
  const dotProduct = vectorDotProduct(playerDirX, playerDirY, monsterVecX, monsterVecY);

  // 벡터 크기 계산
  const playerLength = vectorLength(playerDirX, playerDirY);
  const monsterLength = vectorLength(monsterVecX, monsterVecY);

  // 두 벡터의 코사인 값 계산
  const cosAngle = dotProduct / (playerLength * monsterLength);

  // 코사인 값으로 각도를 계산 (라디안 -> 도)
  const angle = Math.acos(cosAngle);
  return angle * (180 / Math.PI); // 라디안을 도로 변환
}

// 서버에서 공격 처리 함수
function processAttack(playerX, playerY, playerDirX, playerDirY, monsters) {
  const ATTACK_RANGE = 5.0; // 5 유닛 범위
  const ATTACK_ANGLE = 180; // 180도 유효 범위

  monsters.forEach((monster) => {
    const distance = calculateDistance(playerX, playerY, monster.x, monster.y);

    // 공격 범위 내에 몬스터가 있으면
    if (distance <= ATTACK_RANGE) {
      // 각도 계산
      const angleToMonster = calculateAngle(
        playerX,
        playerY,
        playerDirX,
        playerDirY,
        monster.x,
        monster.y,
      );

      // 공격 각도 내에 몬스터가 있으면
      if (angleToMonster <= ATTACK_ANGLE / 2) {
        console.log(`몬스터 (${monster.x}, ${monster.y})를 공격합니다!`);
      } else {
        console.log(`몬스터 (${monster.x}, ${monster.y})는 공격 범위 각도를 벗어났습니다.`);
      }
    } else {
      console.log(`몬스터 (${monster.x}, ${monster.y})는 공격 범위를 벗어났습니다.`);
    }
  });
}

// 예시 몬스터들
const monsters = [
  { x: 10, y: 10 },
  { x: 15, y: 15 },
  { x: 3, y: 4 },
];

// 플레이어의 공격 좌표 및 방향 (클릭된 위치 및 시선 방향)
const playerX = 0;
const playerY = 0;
const playerDirX = -10; // 플레이어가 오른쪽을 바라본다
const playerDirY = 5;

// 공격 처리
processAttack(playerX, playerY, playerDirX, playerDirY, monsters);

//데드레커닝
