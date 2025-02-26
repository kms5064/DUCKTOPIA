import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';
import { roomSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';

class Player {
  constructor(user, atk, x, y) {
    this.user = user; // User Class
    this.maxHp = config.game.player.playerMaxHealth;
    this.hp = config.game.player.playerMaxHealth;
    this.maxHunger = config.game.player.playerMaxHunger;
    this.hunger = config.game.player.playerMaxHunger;
    this.speed = config.game.player.playerSpeed;
    this.range = config.game.player.playerDefaultRange;
    this.angle = config.game.player.playerDefaultAngle;
    this.characterType = config.game.characterType.RED;

    this.lv = 1;
    this.atk = atk;
    this.inventory = Array.from({ length: 16 }, () => 0);
    this.equippedWeapon = null;
    this.x = x;
    this.y = y;
    this.isAlive = true;

    //위치 변경 요청 패킷간의 시간차
    this.packetTerm = 0;
    this.lastPosUpdateTime = Date.now();

    // hunger
    this.hungerCounter = 0;
    this.lastHungerUpdate = 0;
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
      character: {
        characterType: this.characterType,
        hp: this.hp,
        weapon: this.equippedWeapon,
        atk: this.atk,
      },
    };
  }

  //player 메서드 여기에 만들어놓고 나중에 옮기기
  playerPositionUpdate = (dx, dy) => {
    this.x = dx;
    this.y = dy;
  };

  calculatePosition = (x, y) => {
    const now = Date.now();
    this.packetTerm = now - this.lastPosUpdateTime;
    // 현재 위치와 요청받은 위치로 방향을 구하고 speed와 레이턴시를 곱해 이동거리를 구하고 좌표 예측 검증
    const seta = (Math.atan2(y - this.y, x - this.x) * 180) / Math.PI;
    const distance = this.speed * this.packetTerm;
    const realDistance = Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);

    let newX = x;
    let newY = y;

    // 만약 거속시로 구한 거리보다 멀면 서버가 알고있는 좌표로 강제 이동
    //if (Math.abs(distance - realDistance) > config.game.player.validDistance) {
    //  newX = this.x + Math.cos(seta) * distance;
    //  newY = this.y + Math.sin(seta) * distance;
    //  console.error(`유효하지 않은 이동입니다.`);
    //}

    // 위치 적용
    this.playerPositionUpdate(newX, newY);
    this.lastPosUpdateTime = now;

    return { playerId: this.user.id, x: this.x, y: this.y };
  };
  calculateLatency = () => {
    //레이턴시 구하기 => 수정할 것)각 클라마다 다른 레이턴시를 가지고 계산
    //레이턴시 속성명도 생각해볼 필요가 있다
    //player값 직접 바꾸는건 메서드로 만들어서 사용
  };

  /** Hunger System */
  // 허기 초기화
  initHungerUpdate() {
    this.lastHungerUpdate = Date.now();
  }

  // 허기 감소 카운팅 함수
  hungerCheck() {
    const now = Date.now();
    const deltaTime = now - this.lastHungerUpdate;
    this.hungerCounter += deltaTime;
    this.lastHungerUpdate = now;

    if (this.hungerCounter >= config.game.player.playerHungerPeriod) {
      // game 접근
      const game = roomSession.getRoom(this.user.getRoomId()).getGame();

      if (this.hunger > 0) {
        this.changePlayerHunger(-config.game.player.playerHungerDecreaseAmount);

        // console.log('플레이어 아이디' + this.user.id);
        // console.log('플레이어 배고품' + this.hunger);

        // 캐릭터 hunger 동기화 패킷 전송
        const decreaseHungerPacket = makePacket(
          config.packetType.S_PLAYER_HUNGER_UPDATE_NOTIFICATION,
          {
            playerId: this.user.id,
            hunger: this.hunger,
          },
        );

        game.broadcast(decreaseHungerPacket);
      } else {
        // 체력 감소

        this.hp -= config.game.player.playerHpDecreaseAmountByHunger;

        // 캐릭터 hp 동기화 패킷 전송
        const decreaseHpPacket = makePacket(config.packetType.S_PLAYER_HP_UPDATE_NOTIFICATION, {
          playerId: this.user.id,
          hp: this.hp,
        });

        game.broadcast(decreaseHpPacket);
      }

      this.hungerCounter = 0;

      // console.log('현재 아이디 : ', this.user.id, ', 현재 허기 : ', this.hunger, ', 현재 체력 : ', this.hp);
    }
  }

  // 허기 회복
  changePlayerHunger(amount) {
    this.hunger += amount;

    if (this.hunger > this.maxHunger) {
      this.hunger = this.maxHunger;
      this.hungerCounter = 0;
      this.lastHungerUpdate = Date.now();
    } else if (this.hunger < 0) {
      this.hunger = 0;
    }

    return this.hunger;
  }

  /** end of Hunger System */

  // 플레이어 체력 회복 - 2025.02.26 추가
  // changePlayerHunger 메서드 네이밍 변경하여 같이 합치고자 하였으나, 다른데서 이미 사용하고 있는 메서드라 그냥 새로 만듬
  healPlayerHp(amount) {
    this.hp += amount;

    if (this.hp > this.maxHp) {
      this.hp = this.maxHp;
    } else if (this.hp < 0) {
      this.hp = 0;
    }

    return this.hp;
  }

  //플레이어 어택은 데미지만 리턴하기
  getPlayerAtkDamage(weaponAtk) {
    return this.atk + this.lv * config.game.player.atkPerLv + weaponAtk;
  }

  playerDead() {
    this.isAlive = false;
    this.inventory = [];
    return this.isAlive;
  }

  findItemIndex(itemCode) {
    const targetIndex = this.inventory.findIndex((item) => item && item.itemCode === itemCode);
    return targetIndex;
  }

  addItem(itemCode, count, index) {
    if (index === -1) {
      //0이면 안되지;
      //아이템을 이미 갖고 있는지
      const item = this.inventory.find((item) => item && item.itemCode === itemCode);
      //있다면 카운트만 증가
      if (item) {
        item.count += count;
        console.log(`아이템 이미 있어서 count만 증가`);
      } else {
        //없으면 새로 만들어서 push
        const item = { itemCode: itemCode, count: count };
        console.log(`아이템 없어서 count만 증가`);

        const checkRoom = (ele) => ele === 0;
        const emptyIndex = this.inventory.findIndex(checkRoom);
        this.inventory.splice(emptyIndex, 1, item);
      }
      return item;
    } else {
      const item = this.inventory.find((item) => item && item.itemCode === itemCode);
      if (item) {
        item.count += count;
        console.log(`아이템 이미 있어서 count만 증가`);
      } else {
        //없으면 새로 만들어서 push
        const item = { itemCode: itemCode, count: count };
        this.inventory.splice(index, 1, item);
        console.log(`아이템 없어서 새로 만듦`);
      }
      return item;
    }
  }

  removeItem(itemCode, count) {
    const removedItem = this.inventory.find((item) => item && item.itemCode === itemCode);
    const removedItemIndex = this.inventory.findIndex((item) => item && item.itemCode === itemCode);
    if (!removedItem) {
      throw new CustomError('인벤토리에서 아이템을 찾을 수 없습니다.');
    }

    if (removedItem.count > count) {
      removedItem.count -= count;
    } else {
      //아이템을 제거
      this.inventory.splice(removedItemIndex, 1, 0);
    }
  }

  equipWeapon(itemCode) {
    if (this.equippedWeapon === null) {
      const weapon = this.inventory.find((item) => item.itemCode === itemCode);
      this.equippedWeapon = { itemCode: weapon.itemCode, count: 1 };
      this.removeItem(itemCode, 1);
    } else {
      const temp = this.equippedWeapon;
      const weapon = this.inventory.find((item) => item.itemCode === itemCode);
      this.equippedWeapon = { itemCode: weapon.itemCode, count: 1 };
      this.removeItem(itemCode, 1);
      this.addItem(temp.itemCode, 1, -1);
    }

    return this.equippedWeapon;
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

  getPlayerHp() {
    return this.hp;
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
