import { config } from '../../config/config.js';
import { MIN_COOLTIME_MONSTER_AWAKING, MIN_COOLTIME_MONSTER_TRACKING, RANGE_COOLTIME_MONSTER_AWAKING, RANGE_COOLTIME_MONSTER_TRACKING } from '../../config/constants/monster.js';
import MovableObjectBase from '../base/objectBase.class.js';

class Monster extends MovableObjectBase {
  //몬스터는 각각의 인스턴스로 활용될 것이며 이건
  //이건 추상 클래스로써 접근할 것이니
  //위치 동기화는 언제 했는가
  //monsterCode는 몬스터가 어떤 녀석인지 확인하도록 한다.
  //몬스터와 플레이어는 각각 상하좌우를 베이스로 한 8개 방향으로 이동할 수 있도록 한다.
  constructor(
    id,
    monsterCode,
    name,
    hp,
    attack,
    defence,
    range,
    speed,
    x = 0,
    y = 0,
    isWaveMonster = false,
  ) {
    //몬스터가 생성되었을 때의 인덱스 값

    //몬스터 코드에 따라서 데이터를 변경하도록 한다.

    super(id, x, y, range, speed);
    this.monsterCode = monsterCode;
    this.hp = hp;
    this.attack = attack;
    this.defence = defence;
    this.name = name;
    this.monsterCode = 1;
    this.priorityPlayer = null;
    //몬스터가 여러 패턴을 가지고 있을 때 그 패턴들을 이 안에서 쿨타임을 관리한다.
    this.distanceBetweenPlayer = Infinity;
    //드랍 아이템 숫자 확률을 이걸로 정해보자.

    // 웨이브 몬스터 여부
    this.isWaveMonster = isWaveMonster;
    // 몬스터 코드 다르게 하기
    this.monsterAwakeCoolTime = 0;
    this.monsterTrackingTime = 0;
    // 초기 설정을 베이스로 => 플레이어 타입이랑 베이스랑 같이 넣을 수 있나?
  }

  //asset을 통해서 받은 데이터를 기반으로 여기에 데이터를 채워 넣는다.
  //이건 몬스터가 생성되고 이걸 별도의 배열 등에 집어 넣기 전에 불러야 할 것
  //objectbase로 만든 다음엔 이걸 이용해서 스테이터스 설정을 해줘야 할 듯
  setStatus(hp, attack, defence) {
    this.hp = hp;
    this.attack = attack;
    this.defence = defence;
    //console.log(`${this.hp}, ${this.attack}, ${this.defence}`);
  }

  setName(name) {
    this.name = name;
  }

  getAttack() {
    return this.attack;
  }

  AwakeCoolTimeCheck() {
    return this.monsterAwakeCoolTime <= 0 ? true : false;
  }

  getDistanceByPlayer() {
    return this.distanceBetweenPlayer;
  }

  setDamaged(damage) {
    if (damage - this.defence < 0) {
      this.hp -= 1;
    } else {
      this.hp -= damage - this.defence;
    }

    if (this.hp < 0) this.hp = 0;
    return this.hp;
  }

  getDirectByPlayer() {
    const playerPos = this.priorityPlayer.getPlayerPos();
    const vectorX = Math.acos((playerPos.x - this.x) / distance); //+, -를 구분지어서 할 수 있을 듯
    const vectorY = Math.asin((playerPos.y - this.y) / distance);

    return { x: vectorX, y: vectorY };
  }

  getSpeed() {
    return this.speed;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  getId() {
    return this.id;
  }

  getPriorityPlayer() {
    return this.priorityPlayer;
  }

  setMonsterTrackingTime(time = MIN_COOLTIME_MONSTER_TRACKING) {
    this.monsterTrackingTime = time;
  }


  calculateBetweenDistance() {
    if (this.priorityPlayer !== null) {
      const playerPos = this.priorityPlayer.getPlayerPos();
      this.distanceBetweenPlayer = Math.sqrt(
        Math.pow(this.x - playerPos.x, 2) + Math.pow(this.y - playerPos.y, 2),
      );
    }
  }

  returnCalculateDistance(player) {
    const playerPos = player.getPlayerPos();
    const distance = Math.sqrt(Math.pow(this.x - playerPos.x, 2) + Math.pow(this.y - playerPos.y, 2));
    //console.log(`몬스터 ${this.id}:  ${distance} : ${this.awakeRange}`);
    return this.awakeRange > distance ? distance : Infinity;
  }

  //플레이어를 쫒고 있는지 확인한다.
  hasPriorityPlayer() {
    return this.priorityPlayer !== null ? true : false;
  }

  //생성되었을 때 위치 지정은 이걸로 해주자.
  //내 생각에 x, y는 맵의 중간 지점을 (0,0)이라 했을 때의 값이라 생각함
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  isWave() {
    return this.isWaveMonster;
  }

  //몬스터의 플레이어 추적을 잃게 만든다.
  //외부 측에서 타겟 플레이어가 있는지 체크한다.
  lostPlayer() {
    if (this.priorityPlayer === null) {
      //console.log("왜 여기 접근됐지? lost player");
      return true;
    }

    const playerPos = this.priorityPlayer.getPlayerPos();
    const distance = Math.sqrt(
      Math.pow(playerPos.x - this.x, 2) + Math.pow(playerPos.y - this.y, 2),
    );

    //플레이어가 죽었는지 확인하고 죽었다면 타겟팅 해제하기 
    const targetHp = this.priorityPlayer.getPlayerHp();
    if (distance > this.awakeRange + 2 || targetHp <= 0) {
      //인식 범위보다 인식 끊기는 범위가 좀 더 넓어야 할 것이다.
      this.distanceBetweenPlayer = Infinity;
      this.priorityPlayer = null;
      return true;
      //패킷을
    } else {
      this.distanceBetweenPlayer = distance;
      return false;
    }
  }


  //몬스터가 죽거나 할 때 아이템 드롭할 아이템의 숫자를 제공한다.
  dropItemCount() {
    const dropCount =
      10 -
      Math.floor(
        Math.log(Math.ceil(Math.random() * config.game.monster.maxItemDropCount)) / Math.log(2),
      );

    switch (dropCount) {
      case 0:
      case 1:
        return 0;
        break;
      case 2:
      case 3:
      case 4:
      case 5:
        return 1;
        break;
      case 6:
      case 7:
      case 8:
        return 2;
        break;
      case 9:
      case 10:
        return 3;
        break;
    }
  }

  //일단 몬스터가 벗어났을 때 3~8초 동안은 벗어나게 하기
  CoolTimeCheck(deltaTime) {
    if (this.monsterAwakeCoolTime > 0) {
      this.monsterAwakeCoolTime -= deltaTime;
    }
    
    if (this.hasPriorityPlayer() && this.monsterTrackingTime > 0) {
      this.monsterTrackingTime -= deltaTime;

      if (this.monsterTrackingTime <= 0) {
        this.monsterAwakeCoolTime = Math.floor(Math.random() * RANGE_COOLTIME_MONSTER_AWAKING + MIN_COOLTIME_MONSTER_AWAKING);
        this.priorityPlayer = null;
      }
    }
  }

  //몬스터가 사망했을 때의 데이터
  //이후 몬스터 사망 시 아이템 드롭도 해야 하나

  monsterDeath() {
    return this.hp <= 0 ? true : false
  }

  setTargetPlayer(player) {
    this.priorityPlayer = player;
  }

  //플레이어를 세팅할 때의 조건을 확인한다.
  setTargetPlayerByDistance(player) {
    if (this.priorityPlayer === null) {
      const playerPos = player.getPlayerPos();
      const distance = Math.sqrt(Math.pow(this.x - playerPos.x, 2) + Math.pow(this.y - playerPos.y, 2));
      if (distance <= this.awakeRange) {
        this.distanceBetweenPlayer = distance;
        this.priorityPlayer = player;
        //패킷을 보내
      }
    } else {
      if (player !== this.priorityPlayer) {
        const playerPos = this.priorityPlayer.getPlayerPos();
        const distance = Math.sqrt(Math.pow(this.x - playerPos.x, 2) + Math.pow(this.y - playerPos.y, 2));
        if (this.distanceBetweenPlayer > distance) {
          this.priorityPlayer = player;
        }
        this.calculateBetweenDistance();
      }
    }
  }

  monsterDataSend() {
    const monsterData = {
      id: this.id,
      hp: this.hp,
      x: this.x,
      y: this.y,
    };

    return monsterData;
  }

  getMonsterPos() {
    return { x: this.x, y: this.y };
  }

  getMonsterId() {
    return this.id;
  }

  //현재 몬스터와 플레이어 사이에 얼마나 거리가 떨어져 있는지 보기

}

export default Monster;
