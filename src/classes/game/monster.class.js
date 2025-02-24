import { config } from '../../config/config.js';
import {
  MIN_COOLTIME_MONSTER_AWAKING,
  MIN_COOLTIME_MONSTER_TRACKING,
  RANGE_COOLTIME_MONSTER_AWAKING,
  RANGE_COOLTIME_MONSTER_TRACKING,
} from '../../config/constants/monster.js';
import MovableObjectBase from '../base/objectBase.class.js';

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
    this.grade = grade;
    this.name = name;
    this.targetPlayer = null;
    //몬스터가 여러 패턴을 가지고 있을 때 그 패턴들을 이 안에서 쿨타임을 관리한다.
    this.distanceBetweenPlayer = Infinity;

    this.startPoint_x = 0;
    this.startPoint_y = 0;

    // 웨이브 몬스터 여부
    this.isWaveMonster = isWaveMonster;

    // 몬스터의 인식 쿨타임 여부
    this.monsterAwakeCoolTime = 0;
    this.monsterTrackingTime = 0;
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
    if (damage - this.defence < 2) {
      this.hp -= 1;
    } else {
      this.hp -= damage - this.defence;
    }

    if (this.hp < 0) this.hp = 0;
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

  //보스 패턴이 발생했다는 의미
  bossAlert(alert) {
    return alert;
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
      case 1:
      case 2:
      case 3:
      case 4:
        lostDistance = 5;
        break;
      case 5:
        lostDistance = 6;
        break;
      case 6:
        lostDistance = 7;
        break;
      case 7:
        lostDistance = 8;
        break;
      case 8:
        lostDistance = 9;
        break;
    }

    /** 몬스터가 플레이어를 잃는 조건 */
    //1. 몬스터와 플레이어 간의 거리가 인식 범위를 넘어갔을 때
    //2. 타겟 플레이어의 hp가 0이 되었을 때
    //3. 시작 위치에서 일정 이상의 거리를 벗어나게 되었을 때
    const targetHp = this.targetPlayer.getPlayerHp();
    if (distance > this.awakeRange + lostDistance || targetHp <= 0 || distanceFromStartPoint > lostDistance * 2 + this.awakeRange || this.monsterTrackingTime < 0) {
      this.monsterAwakeCoolTime = 1000;
      this.monsterTrackingTime = 0;
      this.distanceBetweenPlayer = Infinity;
      this.targetPlayer = null;
      return true;
    } else {
      this.distanceBetweenPlayer = distance;
      return false;
    }
  }

  isBossMonster() {
    return false;
  }

  //몬스터가 죽거나 할 때 아이템 드롭할 아이템의 숫자를 제공한다.
  // dropItemCount() {
  //   const dropCount =
  //     10 -
  //     Math.floor(
  //       Math.log(Math.ceil(Math.random() * config.game.monster.maxItemDropCount)) / Math.log(2),
  //     );

  //   switch (dropCount) {
  //     case 0:
  //     case 1:
  //       return 0;
  //       break;
  //     case 2:
  //     case 3:
  //     case 4:
  //     case 5:
  //       return 1;
  //       break;
  //     case 6:
  //     case 7:
  //     case 8:
  //       return 2;
  //       break;
  //     case 9:
  //     case 10:
  //       return 3;
  //       break;
  //   }
  // }

  //일단 몬스터가 벗어났을 때 3~8초 동안은 벗어나게 하기
  CoolTimeCheck(deltaTime) {
    if (this.monsterAwakeCoolTime > 0) {
      this.monsterAwakeCoolTime -= deltaTime;
    }
    else if (this.monsterTrackingTime > 0) {
      this.monsterTrackingTime -= deltaTime;
    }
  }
  monsterDeath() {
    return this.hp <= 0 ? true : false;
  }

  //강제로 플레이어를 지정해줄 때
  setTargetPlayer(player) {
    this.monsterAwakeCoolTime = 30000;//일단 트래킹 시간 30초를 주자
    this.targetPlayer = player;
  }

  //몬스터가 죽었을 때의 값들을 여기서 처리할 수 있도록 한다.
  death() {
    const dropcount = this.dropItemCount();

    return dropcount;
  }
}

export default Monster;
