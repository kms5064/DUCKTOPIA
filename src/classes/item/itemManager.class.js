// 전체 아이템 생성 및 관리를 담당함
// 아이템 ID 생성 및 관리, 드롭 테이블 관리 등
// 게임 내 모든 아이템의 생성과 관리에 대한 책임이 있는 클래스임

import Item from './item.class.js';
import ItemBox from './itemBox.class.js';
import { getGameAssets } from '../../init/assets.js';

class ItemManager {
  constructor() {
    this.items = new Map(); // 현재 필드에 존재하는 아이템들
    this.itemBoxes = new Map(); // 현재 존재하는 아이템 박스들 - 유민님이 알아서 삭제하세욧.
    const { dropTable, food, weapon } = getGameAssets();
    this.dropTable = dropTable.data;
    this.foodData = food.data;
    this.weaponData = weapon.data;
    this.lastItemId = 0; // 마지막으로 생성된 아이템의 ID
    this.lastBoxId = 0; // 마지막으로 생성된 박스의 ID

    // 아이템 박스 관련 상수 - 유민님이 알아서 삭제하세욧.
    this.BOX_MAX_SLOTS = 8; // 박스 최대 슬롯 수
    this.ITEM_MIN_COUNT = 1; // 아이템 최소 개수
    this.ITEM_MAX_STACK = 5; // 아이템 최대 스택
  }

  // 아이템 ID 생성
  createItemId() {
    this.lastItemId += 1;
    return this.lastItemId.toString();
  }

  // 박스 ID 생성
  createBoxId() {
    this.lastBoxId += 1;
    return this.lastBoxId;
  }

  // 아이템 박스 생성
  createItemBox(position) {
    const boxId = this.createBoxId();
    const itemBox = new ItemBox(boxId, position.x, position.y);

    // 랜덤 아이템 생성 및 박스에 추가
    const items = this.generateRandomItems();
    items.forEach((item, index) => {
      itemBox.itemList[index] = {
        id: item.id,
        type: item.type,
        name: item.name,
        code: item.code,
        stack: item.stack,
      };
    });

    this.itemBoxes.set(boxId, itemBox);

    // 디버깅용 로그
    console.log(`[아이템 박스 생성] ID: ${boxId}, 위치: (${position.x}, ${position.y})`);
    console.log('[생성된 아이템 목록]');
    items.forEach((item, index) => {
      console.log(`${index + 1}. 아이템: ${item.name}, 개수: ${item.stack}`);
    });

    return itemBox;
  }

  // 랜덤 아이템 생성
  generateRandomItems() {
    const items = [];
    const slotCount = Math.floor(Math.random() * this.BOX_MAX_SLOTS) + 1; // 최소 1개

    for (let i = 0; i < slotCount; i++) {
      // 아이템 타입 결정 (무기 또는 음식)
      const isWeapon = Math.random() < 0.3; // 30% 확률로 무기 생성

      if (isWeapon) {
        // 무기 아이템 생성
        const randomWeapon = this.weaponData[Math.floor(Math.random() * this.weaponData.length)];
        items.push({
          id: this.createItemId(),
          type: Item.Type.WEAPON,
          name: randomWeapon.name,
          code: randomWeapon.code,
          stack: 1, // 무기는 항상 1개만
        });
      } else {
        // 음식 아이템 생성
        const randomFood = this.foodData[Math.floor(Math.random() * this.foodData.length)];
        const stack = Math.floor(Math.random() * this.ITEM_MAX_STACK) + this.ITEM_MIN_COUNT;
        items.push({
          id: this.createItemId(),
          type: Item.Type.FOOD,
          name: randomFood.name,
          code: randomFood.code,
          stack: stack,
        });
      }
    }

    return items;
  }

  // 몬스터 사망 시 아이템 생성
  createDropItems(monsterGrade, position) {
    // 드롭 확률 체크
    if (!this.rollDropItems(monsterGrade)) {
      return [];
    }

    // 드롭할 아이템 개수 결정
    const count = this.rollItemCount(monsterGrade);
    if (count === 0) return [];

    // 아이템 생성
    const items = [];
    for (let i = 0; i < count; i++) {
      const itemGrade = this.rollItemGrade(monsterGrade);
      const item = this.createItem(itemGrade, position);
      if (item) {
        this.items.set(item.id, item);
        items.push(item);
      }
    }

    return items;
  }

  // 아이템 드롭 여부 결정
  rollDropItems(monsterGrade) {
    const dropRate = this.dropTable[monsterGrade].dropRate;
    return Math.random() * 100 <= dropRate;
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
    // 무기 또는 음식 결정 (30% 확률로 무기)
    const isWeapon = Math.random() < 0.3;

    if (isWeapon) {
      const availableWeapons = this.weaponData.filter((weapon) => weapon.grade === itemGrade);
      if (availableWeapons.length === 0) return null;

      const randomWeapon = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
      return new Item({
        id: this.createItemId(),
        type: Item.Type.WEAPON,
        name: randomWeapon.name,
        position: this.addRandomOffset(position),
        code: randomWeapon.code,
      });
    } else {
      const availableFoods = this.foodData.filter((food) => food.grade === itemGrade);
      if (availableFoods.length === 0) return null;

      const randomFood = availableFoods[Math.floor(Math.random() * availableFoods.length)];
      return new Item({
        id: this.createItemId(),
        type: Item.Type.FOOD,
        name: randomFood.name,
        position: this.addRandomOffset(position),
        code: randomFood.code,
      });
    }
  }

  // 아이템 위치에 랜덤성 추가
  addRandomOffset(position) {
    const randomOffset = 0.5;
    return {
      x: position.x + (Math.random() - 0.5) * randomOffset,
      y: position.y + (Math.random() - 0.5) * randomOffset,
    };
  }

  // 아이템 제거
  removeItem(itemId) {
    return this.items.delete(itemId);
  }

  // 아이템 조회
  getItem(itemId) {
    return this.items.get(itemId);
  }

  // 모든 아이템 조회
  getAllItems() {
    return Array.from(this.items.values());
  }
}

export default ItemManager;
