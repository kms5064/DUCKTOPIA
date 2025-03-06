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
    this.atk = atk; //10
    this.inventory = Array.from({ length: 16 }, () => 0);
    this.equippedWeapon = null;
    this.equippedArmors = {
      top: null,
      bottom: null,
      shoes: null,
      helmet: null,
      accessory: null,
    };
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

  changePlayerHp(amount, game) {
    // 플레이어 체력 감소 및 회복 (체력 회복은 음수로 보냄)
    // 데미지를 받는 경우 (amount > 0)에만 방어력 적용
    if (amount > 0) {
      // 방어력 계산
      const defense = this.calculateArmorEffects(game);

      // 비율 감산 방식 적용 (감쇠 곡선)
      const damageReductionFactor = 100 / (100 + defense);

      // 원래 데미지와 감소된 데미지 로그 출력 (디버깅용)
      console.log('[방어력 계산]', {
        원래데미지: amount,
        방어력: defense,
        감소율: (1 - damageReductionFactor) * 100 + '%',
        최종데미지: Math.max(1, Math.floor(amount * damageReductionFactor)),
      });

      // 최종 데미지 계산 (최소 1의 데미지는 입도록 함)
      amount = Math.max(1, Math.floor(amount * damageReductionFactor));
    }

    this.hp = Math.min(Math.max(this.hp - amount, 0), this.maxHp);
    this.hp = Math.min(Math.max(this.hp - amount, 0), this.maxHp);
    return this.hp;
  }

  getData() {
    return {
      characterType: this.characterType,
      hp: this.hp,
      weapon: this.equippedWeapon,
      armors: this.equippedArmors,
      atk: this.atk,
    };
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

    return { playerId: this.id, x: this.x, y: this.y };
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
  getPlayerAtkDamage(totalAtk) {
    // return this.atk + this.lv * config.game.player.atkPerLv + weaponAtk;
    return totalAtk + Math.floor(Math.random() * this.atk);
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
      if (item) {
        item.count += count;
      } else {
        //없으면 새로 만들어서 push
        const item = { itemCode: itemCode, count: count };

        const checkRoom = (ele) => ele === 0;
        const emptyIndex = this.inventory.findIndex(checkRoom);
        this.inventory.splice(emptyIndex, 1, item);
        return item;
      }
      return item;
    } else {
      const item = this.inventory.find((item) => item && item.itemCode === itemCode);
      if (item) {
        item.count += count;
      } else {
        //없으면 새로 만들어서 push
        const item = { itemCode: itemCode, count: count };
        this.inventory.splice(index, 1, item);
        return item;
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

  // 무기 장착
  equipWeapon(itemCode) {
    if (this.equippedWeapon === null) {
      const weapon = this.inventory.find((item) => item.itemCode === itemCode);
      if (!weapon) throw new CustomError(`인벤토리에서 장착하려는 아이템을 찾지 못했습니다.`);

      this.equippedWeapon = { itemCode: weapon.itemCode, count: 1 };
      this.removeItem(itemCode, 1);
    } else {
      const temp = this.equippedWeapon;
      const weapon = this.inventory.find((item) => item.itemCode === itemCode);
      if (!weapon) throw new CustomError(`인벤토리에서 장착하려는 아이템을 찾지 못했습니다.`);

      this.equippedWeapon = { itemCode: weapon.itemCode, count: 1 };
      this.removeItem(itemCode, 1);
      this.addItem(temp.itemCode, 1, -1);
    }

    return this.equippedWeapon;
  }

  // 방어구 장착
  equipArmor(armorType, itemCode) {
    if (this.equippedArmors[armorType] === null) {
      const armor = this.inventory.find((item) => item.itemCode === itemCode);
      this.equippedArmors[armorType] = { itemCode: armor.itemCode, count: 1 };
      this.removeItem(itemCode, 1);
    } else {
      const temp = this.equippedArmors[armorType];
      const armor = this.inventory.find((item) => item.itemCode === itemCode);
      this.equippedArmors[armorType] = { itemCode: armor.itemCode, count: 1 };
      this.removeItem(itemCode, 1);
      this.addItem(temp.itemCode, 1, -1);
    }

    return this.equippedArmors[armorType];
  }

  // 방어구 효과 계산 (방어력 등)
  calculateArmorEffects(game) {
    let totalDefense = 0;
    const armorDefenseDetails = {}; // 디버깅용 상세 정보

    // 각 방어구 타입별로 방어력 계산
    Object.entries(this.equippedArmors).forEach(([armorType, armor]) => {
      if (armor !== null) {
        // 방어구 데이터 조회
        let armorData;
        let dataSource = null;

        // 방어구 타입에 따라 다른 데이터 소스에서 조회
        switch (armorType) {
          case 'helmet':
            dataSource = game.itemManager.armorHelmetData;
            armorData = dataSource?.find((item) => item.code === armor.itemCode);
            break;
          case 'top':
            dataSource = game.itemManager.armorTopData;
            armorData = dataSource?.find((item) => item.code === armor.itemCode);
            break;
          case 'bottom':
            dataSource = game.itemManager.armorBottomData;
            armorData = dataSource?.find((item) => item.code === armor.itemCode);
            break;
          case 'shoes':
            dataSource = game.itemManager.armorShoesData;
            armorData = dataSource?.find((item) => item.code === armor.itemCode);
            break;
          case 'accessory':
            dataSource = game.itemManager.armorAccessoryData;
            armorData = dataSource?.find((item) => item.code === armor.itemCode);
            break;
        }

        // 디버깅 로그용 정보 저장
        armorDefenseDetails[armorType] = {
          itemCode: armor.itemCode,
          hasDataSource: !!dataSource,
          dataSourceLength: dataSource?.length || 0,
          armorData: armorData ? { ...armorData } : null,
          defense: armorData?.defense || 0,
        };

        // 방어구 데이터가 있고 defense 속성이 있으면 방어력에 추가
        if (armorData && armorData.defense) {
          totalDefense += armorData.defense;
        }
      }
    });

    // 디버깅 로그 출력
    console.log('[방어구 방어력 계산 상세]', {
      armorDefenseDetails,
      totalDefense,
    });

    return totalDefense;
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
}

export default Player;
