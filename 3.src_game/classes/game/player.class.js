import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';

class Player {
  constructor(id, atk, x, y) {
    this.id = id;

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

  changePlayerHp(amount) {
    // 플레이어 체력 감소 및 회복 (체력 회복은 음수로 보냄)
    this.hp = Math.min(Math.max(this.hp - amount, 0), this.maxHp);
    return this.hp;
  }

  getData() {
    return {
      characterType: this.characterType,
      hp: this.hp,
      weapon: this.equippedWeapon,
      atk: this.atk,
    };
  }

  getPlayerPos() {
    return { x: this.x, y: this.y };
  }

  changePlayerPos(x, y) {
    this.x = x;
    this.y = y;
    return { x: this.x, y: this.y };
  }

  //player 메서드 여기에 만들어놓고 나중에 옮기기
  playerPositionUpdate = (dx, dy) => {
    this.x = dx;
    this.y = dy;
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
      const user = userSession.getUser(this.id);
      const game = gameSession.getGame(user.getGameId());

      if (this.hunger > 0) {
        this.changePlayerHunger(-config.game.player.playerHungerDecreaseAmount);

        // console.log('플레이어 아이디' + this.id);
        // console.log('플레이어 배고품' + this.hunger);

        // 캐릭터 hunger 동기화 패킷 전송
        const decreaseHungerPacket = [
          config.packetType.S_PLAYER_HUNGER_UPDATE_NOTIFICATION,
          {
            playerId: this.id,
            hunger: this.hunger,
          },
        ];

        game.broadcast(decreaseHungerPacket);
      } else {
        // 체력 감소

        this.hp -= config.game.player.playerHpDecreaseAmountByHunger;

        // 캐릭터 hp 동기화 패킷 전송
        const decreaseHpPacket = [
          config.packetType.S_PLAYER_HP_UPDATE_NOTIFICATION,
          {
            playerId: this.id,
            hp: this.hp,
          },
        ];

        game.broadcast(decreaseHpPacket);
      }

      this.hungerCounter = 0;

      // console.log('현재 아이디 : ', this.user.id, ', 현재 허기 : ', this.hunger, ', 현재 체력 : ', this.hp);
    }
  }

  changePlayerHunger(amount) {
    this.hunger = Math.min(Math.max(this.hunger + amount, 0), this.maxHunger);

    if (this.hunger === this.maxHunger) {
      this.lastHungerUpdate = Date.now();
      this.hungerCounter = 0;
    }

    return this.hunger;
  }

  /** end of Hunger System */

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
    const targetIndex = this.inventory.findIndex((item) => item.itemCode === itemCode);
    return targetIndex;
  }

  addItem(itemCode, count, index) {
    if (index === -1) {
      //0이면 안되지;
      //아이템을 이미 갖고 있는지
      const item = this.inventory.find((item) => item && item.itemCode === itemCode);
      //있다면 카운트만 증가
      if (item) item.count += count;
      else {
        //없으면 새로 만들어서 push
        const item = { itemCode: itemCode, count: count };

        const checkRoom = (ele) => ele === 0;
        const emptyIndex = this.inventory.findIndex(checkRoom);
        this.inventory.splice(emptyIndex, 0, item);
      }
      return item;
    } else {
      const item = this.inventory.find((item) => item && item.itemCode === itemCode);
      if (item) item.count += count;
      else {
        //없으면 새로 만들어서 push
        const item = { itemCode: itemCode, count: count };
        this.inventory.splice(index, 0, item);
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

  getPlayerHp() {
    return this.hp;
  }

  revival(pos_x, pos_y) {
    if (this.isAlive) {
      return;
    }
    else {
      this.isAlive = true;
      this.hp = this.maxHp;
      this.x = pos_x;
      this.y = pos_y;
    }
  }
}

export default Player;
