import { config } from '../../config/config.js';

class Player {
  constructor( user, atk, x, y) {
    this.user = user; // User Class
    this.maxHp = config.game.player.playerMaxHealth;
    this.hp = config.game.player.playerMaxHealth;
    this.hunger = config.game.player.playerMaxHunger;
    this.speed = config.game.player.playerSpeed;
    this.range = config.game.player.playerDefaultRange;
    this.angle = config.game.player.playerDefaultAngle;
    this.characterType = config.game.characterType.RED;

    this.lv = 1;
    this.atk = atk;
    this.inventory = [];
    this.equippedWeapon = 0;
    this.x = x;
    this.y = y;
    this.isAlive = true;


    //위치 변경 요청 패킷간의 시간차
    this.packetTerm = 0; 
    this.lastPosUpdateTime = Date.now();
  }

  changePlayerHp(damage) {
    this.hp -= damage;
    return this.hp;
  }

  getPlayerPos() {
    return { x: this.x, y: this.y };
  }

  changePlayerPos(x, y) {
    this.x = x;
    this.y = y;
    return { x: this.x, y: this.y };
  }

  getPlayerData() {
    return {
      ...this.user.getUserData(),
      characterData: {
        characterType: this.characterType,
        hp: this.hp,
        weapon: this.equippedWeapon,
        atk: this.atk,
      }
    }
  }

  //player 메서드 여기에 만들어놓고 나중에 옮기기
  playerPositionUpdate = (dx, dy) => {
    this.x = dx;
    this.y = dy;
  };

  calculatePosition = (x, y) => {
    const now = Date.now()
    this.packetTerm = now - this.lastPosUpdateTime
    // 현재 위치와 요청받은 위치로 방향을 구하고 speed와 레이턴시를 곱해 이동거리를 구하고 좌표 예측 검증
    const seta = (Math.atan2(y - this.y, x - this.x) * 180) / Math.PI;
    const distance = this.speed * this.packetTerm;
    const realDistance = Math.sqrt((this.x - x)**2 + (this.y - y)**2)

    let newX = y;
    let newY = x;
    // 만약 거속시로 구한 거리보다 멀면 서버가 알고있는 좌표로 강제 이동
    if (Math.abs(distance - realDistance) > config.game.player.validDistance) {
      newX = this.x + Math.cos(seta) * distance;
      newY = this.y + Math.sin(seta) * distance;
      console.error(`유효하지 않은 이동입니다.`);
    } 

    // 위치 적용
    this.playerPositionUpdate(newX, newY);
    this.lastPosUpdateTime = now

    return { playerId: this.user.id, x: this.x, y: this.y };
  };

  calculateLatency = () => {
    //레이턴시 구하기 => 수정할 것)각 클라마다 다른 레이턴시를 가지고 계산
    //레이턴시 속성명도 생각해볼 필요가 있다
    ; //player값 직접 바꾸는건 메서드로 만들어서 사용
    
  };

  changePlayerHunger(amount) {
    this.hunger += amount;
    return this.hunger;
  }
  //플레이어 어택은 데미지만 리턴하기
  getPlayerAtkDamage() {
    return this.atk + this.lv * ATK_PER_LV + this.equippedWeapon.atk;
  }

  playerDead() {
    this.isAlive = false;
    this.inventory = [];
    return this.isAlive;
  }

  findItemIndex(itemId) {
    const targetIndex = this.inventory.findIndex((item) => (item.id = itemId));
    return targetIndex;
  }

  addItem(item) {
    this.inventory.push(item);
    return this.inventory;
  }

  removeItem(itemId) {
    const targetIndex = this.findItemIndex(itemId);
    this.inventory.splice(targetIndex, 1);
    return this.inventory;
  }

  //공격 사거리 변경
  changeRange(range) {
    this.range = range;
  }

  //공격 각도 변경
  changeAngle(angle) {
    this.angle = angle;
  }

  getRange() {
    return this.range;
  }

  getAngle() {
    return this.angle;
  }

  getUser() {
    return this.user;
  }
}

export default Player;



//유저 동기화는 어떤 방식으로 하지?
//hp, lv, hunger,inventory,equippedWeapon,isAlive같은 status는 변화가 있을때만 동기화하기
//hp변화(피격) 브로드캐스트용 패킷
//lv변화 브로드캐스트용 패킷 / 필요한가?
//hunger변화 브로드캐스트용 패킷 / 필요한가?
//equippedWeapon변화 브로드캐스트용 패킷
//isAlive변화 브로드캐스트용 패킷

//위치 같은 계속 변화하는건 루프(프레임)마다 동기화
//위치 패킷
//키업다운때만 동기화
//위치 패킷은 클라에서 받은 입력(새 좌표)를 받아서 저장하고 저장된 좌표를 나를 제외한 세션의 모든 클라에게 보낸다.
//너무 자주 보내지 말고 시간을 잘 조절해 보자

//키보드로 움직이는 게임은 보통 클라에서 먼저 움직이고 서버에 통보하며 통보된 위치를 브로드캐스트

//가시랜더링 생각해보기

//허기가0이면 데미지를 받는다