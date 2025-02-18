// 전체 아이템 생성 및 관리를 담당함
// 아이템 ID 생성 및 관리, 드롭 테이블 관리 등
// 게임 내 모든 아이템의 생성과 관리에 대한 책임이 있는 클래스임

import Item from './item.class.js';
import { getGameAssets } from '../../init/assets.js';

class ItemManager {
  constructor() {
    this.items = new Map(); // 현재 필드에 존재하는 아이템들
    const { dropTable, food } = getGameAssets();
    this.dropTable = dropTable.data;
    this.foodData = food.data;
    this.lastItemId = 0; // 마지막으로 생성된 아이템의 ID
  }

  // 아이템 ID 생성
  createItemId() {
    this.lastItemId += 1;
    return this.lastItemId.toString();
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
    // 현재는 식량 아이템만 구현
    const availableitems = this.foodData.filter((food) => food.grade === itemGrade);
    if (availableitems.length === 0) return null;

    const randomItem = availableitems[Math.floor(Math.random() * availableitems.length)];

    // 아이템 위치에 랜덤성 추가
    const randomOffset = 0.5;
    const randomPosition = {
      x: position.x + (Math.random() - 0.5) * randomOffset,
      y: position.y + (Math.random() - 0.5) * randomOffset,
    };

    return new Item({
      id: this.createItemId(),
      type: Item.Type.FOOD,
      name: randomItem.name,
      position: randomPosition,
      code: randomItem.code,
    });
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
