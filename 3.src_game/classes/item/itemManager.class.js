// 전체 아이템 생성 및 관리를 담당함
// 아이템 생성 및 드롭 테이블 관리 등
// 게임 내 모든 아이템의 생성에 대한 책임이 있는 클래스임

import Item from './item.class.js';
import { getGameAssets } from '../../init/assets.js';
import { config } from '../../config/config.js';

class ItemManager {
  constructor() {
    const {
      dropTable,
      food,
      weapon,
      armorTop,
      armorBottom,
      armorHelmet,
      armorShoes,
      armorAccessory,
    } = getGameAssets();

    this.itemBoxes = new Map(); // 현재 존재하는 아이템 박스들
    this.fieldDropItems = new Map(); // 필드에 드롭된 아이템들
    this.lastItemId = 1; // 마지막으로 생성된 아이템의 ID
    this.dropTable = dropTable.data;
    this.foodData = food.data;
    this.weaponData = weapon.data;
    this.lastObjectId = 1; // 마지막으로 생성된 박스의 ID
    this.armorTopData = armorTop.data;
    this.armorBottomData = armorBottom.data;
    this.armorHelmetData = armorHelmet.data;
    this.armorShoesData = armorShoes.data;
    this.armorAccessoryData = armorAccessory.data;
  }

  // 박스 ID 생성
  createObjectId() {
    this.lastObjectId += 1;
    return this.lastObjectId;
  }

  // 아이템 ID 생성
  createItemId() {
    return this.lastItemId++;
  }

  // 랜덤 아이템  - 박스
  generateRandomItems() {
    const items = [];
    const slotCount = Math.floor(Math.random() * config.game.itemBox.itemMaxSpawn) + 1; // 최소 1개

    for (let i = 0; i < slotCount; i++) {
      // 아이템 타입 결정 (무기 또는 음식)
      const isWeapon = Math.random() < 0.3; // 30% 확률로 무기 생성

      if (isWeapon) {
        // 무기 아이템 생성
        const randomWeapon = this.weaponData[Math.floor(Math.random() * 20)];
        items.push(
          new Item({
            itemData: {
              itemCode: randomWeapon.code,
              count: 1, // 무기는 항상 1개만
            },
            position: null,
          }),
        );
      } else {
        // 음식 아이템 생성
        const randomFood = this.foodData[Math.floor(Math.random() * this.foodData.length)];
        const count =
          Math.floor(Math.random() * config.game.itemBox.itemMaxSpawn) +
          config.game.itemBox.itemMinCount;
        items.push(
          new Item({
            itemData: {
              itemCode: randomFood.code,
              count: count,
            },
            position: null,
          }),
        );
      }
    }

    return items;
  }

  // 몬스터 사망 시 아이템 생성
  createDropItems(monsterGrade, position) {
    // console.log(`\n[아이템 드롭 시작]`);
    // console.log(`몬스터 등급: ${monsterGrade}`);
    // console.log(`몬스터 위치: x=${position.x}, y=${position.y}`);
    // console.log(`현재 필드 아이템 수: ${this.fieldDropItems.size}`);

    // 드롭 확률 체크
    if (!this.rollDropItems(monsterGrade)) {
      // console.log('[아이템 드롭 실패] 드롭 확률 체크 실패');
      return [];
    }

    // 드롭할 아이템 개수 결정
    const count = this.rollItemCount(monsterGrade);
    // console.log(`[아이템 개수 결정] ${count}개`);

    if (count === 0) {
      // console.log('[아이템 드롭 실패] 드롭 개수 0');
      return [];
    }

    // 아이템 생성
    const items = [];
    for (let i = 0; i < count; i++) {
      const itemGrade = this.rollItemGrade(monsterGrade);
      // console.log(`[${i + 1}번째 아이템] 등급: ${itemGrade}`);

      const item = this.createItem(itemGrade, position);
      if (item) {
        items.push(item);
        // console.log(
        //    `- 아이템 생성 성공: 코드=${item.itemData.itemCode}, 위치=(${item.position.x}, ${item.position.y})`,
        // );
      } else {
        // console.log(`- 아이템 생성 실패: ${itemGrade} 등급의 아이템을 찾을 수 없음`);
      }
    }

    // console.log(`\n[아이템 드롭 완료]`);
    // console.log(`- 생성 시도: ${count}개`);
    // console.log(`- 실제 생성: ${items.length}개`);
    // console.log(`- 현재 필드 아이템 수: ${this.fieldDropItems.size}`);

    return items;
  }

  // 아이템 드롭 여부 결정
  rollDropItems(monsterGrade) {
    // console.log(`\n[드롭 확률 체크]`);
    // console.log(`몬스터 등급: ${monsterGrade}`);
    // console.log(`드롭 테이블:`, this.dropTable);

    const dropRate = this.dropTable[monsterGrade]?.dropRate;
    // console.log(`해당 등급 드롭율: ${dropRate}`);

    if (!dropRate) {
      // console.log(`[경고] ${monsterGrade} 등급의 드롭 테이블이 없습니다.`);
      return false;
    }

    const roll = Math.random() * 100;
    const result = roll <= dropRate;
    // console.log(`주사위: ${roll.toFixed(2)} vs 드롭율: ${dropRate} => ${result ? '성공' : '실패'}`);

    return result;
  }

  // 드롭할 아이템 개수 결정
  rollItemCount(monsterGrade) {
    const { min, max } = this.dropTable[monsterGrade].itemCount;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 아이템 등급 결정
  rollItemGrade(monsterGrade) {
    const itemGradeRates = this.dropTable[monsterGrade].itemGradeRates;
    const random = Math.random() * 100;
    let sum = 0;

    for (const [grade, rates] of Object.entries(itemGradeRates)) {
      sum += rates;
      if (random <= sum) {
        return grade;
      }
    }
    return 'COMMON';
  }

  // 아이템 생성
  createItem(itemGrade, position) {
    // 무기, 방어구, 음식 생성 (10% - 무기 / 20% - 방어구 / 70% - 음식)
    const isWeapon = Math.random() < 0.1;
    const isArmor = Math.random() < 0.2;
    const isFood = Math.random() < 0.7;

    const itemId = this.lastItemId++;

    if (isWeapon) {
      const availableWeapons = this.weaponData.filter((weapon) => weapon.grade === itemGrade && weapon.isMustard === false);
      if (availableWeapons.length === 0) return null;

      const randomWeapon = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
      const item = new Item({
        itemData: {
          itemCode: randomWeapon.code,
          count: 1,
        },
        position: this.addRandomOffset(position),
      });
      this.fieldDropItems.set(itemId, { itemId, ...item });
      return item;
    } else if (isArmor) {
      // 방어구 타입 랜덤 선택 (상의/하의/투구/신발/장신구)
      const armorTypes = ['armorTop', 'armorBottom', 'armorHelmet', 'armorShoes', 'armorAccessory'];
      const randomType = armorTypes[Math.floor(Math.random() * armorTypes.length)];
      const availableArmors = this[randomType + 'Data'].filter(
        (armor) => armor.grade === itemGrade,
      );

      if (availableArmors.length === 0) return null;

      const randomArmor = availableArmors[Math.floor(Math.random() * availableArmors.length)];
      const item = new Item({
        itemData: {
          itemCode: randomArmor.code,
          count: 1,
        },
        position: this.addRandomOffset(position),
      });
      this.fieldDropItems.set(itemId, { itemId, ...item });
      return item;
    } else if (isFood) {
      const availableFoods = this.foodData.filter((food) => food.grade === itemGrade);
      if (availableFoods.length === 0) return null;

      const randomFood = availableFoods[Math.floor(Math.random() * availableFoods.length)];
      const item = new Item({
        itemData: {
          itemCode: randomFood.code,
          count: 1, // 항상 1개씩 생성하도록 수정
        },
        position: this.addRandomOffset(position),
      });
      this.fieldDropItems.set(itemId, { itemId, ...item });
      return item;
    }
    return null;
  }

  // 아이템 위치에 랜덤성 추가
  addRandomOffset(position) {
    const randomOffset = 2; // 반경 2로 수정
    return {
      x: position.x + (Math.random() - 0.5) * randomOffset,
      y: position.y + (Math.random() - 0.5) * randomOffset,
    };
  }

  // 필드 드롭 아이템 제거
  removeFieldDropItem(itemId) {
    return this.fieldDropItems.delete(itemId);
  }

  // 필드 드롭 아이템 조회
  getFieldDropItem(itemId) {
    return this.fieldDropItems.get(itemId);
  }

  // 모든 필드 드롭 아이템 조회
  getAllFieldDropItems() {
    return Array.from(this.fieldDropItems.values());
  }
}

export default ItemManager;
