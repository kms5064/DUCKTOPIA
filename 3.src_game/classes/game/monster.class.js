import MovableObjectBase from '../base/movableObjectBase.class.js';

class Monster extends MovableObjectBase {
  constructor(
    id,
    code, // monster.json의 monsterCode -> code로 변경됐으므로 이름 변경
    name,
    hp,
    attack,
    defence,
    range,
    speed,
    grade,
    x = 0,
    y = 0,
    isWaveMonster = false,
  ) {
    //moveObject에서 id, 좌표값, 범위, 스피드를 가지고 있다.
    super(id, x, y, range, speed);
    this.code = code;
    this.hp = hp;
    this.attack = attack;
    this.defence = defence;
    this.name = name;
    this.targetPlayer = null;
    //몬스터가 여러 패턴을 가지고 있을 때 그 패턴들을 이 안에서 쿨타임을 관리한다.
    this.distanceBetweenPlayer = Infinity;
    this.grade = grade;

    this.startPoint_x = 0;
    this.startPoint_y = 0;

    // 웨이브 몬스터 여부
    this.isWaveMonster = isWaveMonster;

    // 몬스터의 인식 쿨타임 여부
    this.monsterAwakeCoolTime = 0;
  }

  setName(name) {
    this.name = name;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setStartPosition(x, y) {
    this.startPoint_x = x;
    this.startPoint_y = y;
    this.setPosition(x, y);
  }

  getAttack() {
    return this.attack;
  }

  AwakeCoolTimeCheck() {
    return this.monsterAwakeCoolTime <= 0 ? true : false;
  }

  getDistanceByPlayer() {
    this.calculateBetweenDistance();
    return this.distanceBetweenPlayer;
  }

  //데미지를 받았을 때
  setDamaged(damage) {
    const currentDamage = damage - this.defence;
    this.hp -= Math.min(Math.max(currentDamage, 1), this.hp);
    return this.hp;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  getId() {
    return this.id;
  }

  getTargetPlayer() {
    return this.targetPlayer;
  }

  /**타겟이 지정되어 있을 때 거리를 구하는 함수 */
  calculateBetweenDistance() {
    if (this.targetPlayer !== null) {
      const playerPos = this.targetPlayer.getPlayerPos();
      this.distanceBetweenPlayer = Math.sqrt(
        Math.pow(this.x - playerPos.x, 2) + Math.pow(this.y - playerPos.y, 2),
      );
    }
  }

  /**현재 플레이어가 지정이 되어 있지 않았을 때  */
  returnCalculateDistance(player) {
    const playerPos = player.getPlayerPos();
    const distance = Math.sqrt(
      Math.pow(this.x - playerPos.x, 2) + Math.pow(this.y - playerPos.y, 2),
    );
    return this.awakeRange > distance ? distance : Infinity;
  }

  /**플레이어의 등록 확인*/
  hasTargetPlayer() {
    return this.targetPlayer !== null ? true : false;
  }

  //몬스터의 플레이어 추적을 잃게 만든다.
  //외부 측에서 타겟 플레이어가 있는지 체크한다.
  lostPlayer() {
    if (this.targetPlayer === null) {
      return true;
    }

    const playerPos = this.targetPlayer.getPlayerPos();
    const distance = Math.sqrt(
      Math.pow(playerPos.x - this.x, 2) + Math.pow(playerPos.y - this.y, 2),
    );

    const distanceFromStartPoint = Math.sqrt(
      Math.pow(this.x - this.startPoint_x, 2) + Math.pow(this.y - this.startPoint_y, 2),
    );

    let lostDistance = 1;

    switch (this.code) {
      case 201:
      case 202:
      case 203:
        lostDistance = 1.5;
        break;
      case 204:
      case 205:
        lostDistance = 4;
        break;
      case 206:
        lostDistance = 2.5;
        break;
      case 207:
        lostDistance = 3;
        break;
      case 208: //보스 몬스터인데 혹시 보스가 아니게 될 수 있으니까.
        lostDistance = 20;
        break;
    }

    /** 몬스터가 플레이어를 잃는 조건 */
    //1. 몬스터와 플레이어 간의 거리가 인식 범위를 넘어갔을 때
    //2. 타겟 플레이어의 hp가 0이 되었을 때
    //3. 시작 위치에서 일정 이상의 거리를 벗어나게 되었을 때
    const targetHp = this.targetPlayer.getPlayerHp();
    if (
      distance > this.awakeRange + lostDistance ||
      targetHp <= 0 ||
      distanceFromStartPoint > lostDistance * 2 + this.awakeRange
    ) {
      switch (this.code) {
        case 201:
        case 202:
        case 203:
          this.monsterAwakeCoolTime = 2000;//2초에서 3초 정도 인식을 하지 않도록 만든다.
          break;
        case 204:
        case 205:
          this.monsterAwakeCoolTime = 4000;//원거리 계통 캐릭터들은 좀 길게 텀을 주자.
          break;
        case 206:
        case 207:
        case 208:
          this.monsterAwakeCoolTime = 3000;//보스 몬스터와 암살자 타입은 인식 쿨타임이 없는 걸로
          break;
      }
      this.distanceBetweenPlayer = Infinity;
      this.targetPlayer = null;
      return true;
    } else {
      this.distanceBetweenPlayer = distance;
      return false;
    }
  }

  //0보다 큰 값의 시간 값들을 체크하기
  CoolTimeCheck(deltaTime) {
    if (this.monsterAwakeCoolTime > 0) {
      this.monsterAwakeCoolTime -= deltaTime;
    }
  }
  monsterDeath() {
    return this.hp <= 0 ? true : false;
  }

  //강제로 플레이어를 지정해줄 때
  setTargetPlayer(player) {
    this.targetPlayer = player;
  }

  getMonsterPos() {
    return { x: this.x, y: this.y };
  }

  getMonsterId() {
    return this.id;
  }

  waveMonsterCheck() {
    return this.isWaveMonster;
  }

  isBossMonster() {
    return false;
  }

  //현재 몬스터와 플레이어 사이에 얼마나 거리가 떨어져 있는지 보기
}

export default Monster;
