import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';

class Core {
  constructor(maxHp) {
    this.objectId = 1;
    this.objectCode = 1;
    this.itemData = [];
    this.x = 0;
    this.y = 0;
    this.coreHp = maxHp;
    this.occupied = null;
  }

  getCoreData() {
    return {
      ObjectData: { objectId: this.objectId, objectCode: this.objectCode },
      itemData: this.itemData,
      x: this.x,
      y: this.y,
    };
  }

  getCoreHp() {
    return this.coreHp;
  }

  coreDamaged(damage) {
    this.coreHp -= damage;
    return this.coreHp;
  }

  getItemList() {
    return this.itemData;
  }

  //플레이어가 박스에서 꺼내기
  takeOutAnItem(player, itemCode, count, emptyIndex) {
    //temType을 기반으로 박스에 아이템 조회
    const removedItem = this.itemData.find((item) => item.itemCode === itemCode);
    const removedItemIndex = this.itemData.findIndex((item) => item.itemCode === itemCode);
    if (!removedItem) {
      throw new CustomError('상자에서 아이템을 찾을 수 없습니다.');
    }

    //보유량이 더 많으면 갯수만 줄이기
    if (removedItem.count > count) {
      removedItem.count -= count;
      const item = player.addItem(itemCode, count, emptyIndex);
    } else {
      //아이템을 제거하고 stack만큼만 아이템을 반환하도록
      count = removedItem.count;
      this.itemData.splice(removedItemIndex, 1, 0);
      const item = player.addItem(itemCode, count, emptyIndex);
      return item;
    }
    //player 인벤토리에 추가된 item반환
    return removedItem;
  }
  //플레이어가 박스에 넣기
  putAnItem(player, itemCode, count) {
    const existItem = this.itemData.find((item) => item.itemCode === itemCode);
    if (existItem) {
      existItem.count += count;
      if (player) player.removeItem(itemCode, count);
      return existItem;
    } else {
      const item = { itemCode: itemCode, count: count };
      this.itemData.push(item);
      if (player) player.removeItem(itemCode, count);
      return item;
    }
  }

  createMustardItem(materialCounts) {
    // 생성 가능 개수
    const createCount = materialCounts.reduce((a, b) => Math.min(a, b));

    const materialCodes = [
      config.game.item.mustardMaterialCode1,
      config.game.item.mustardMaterialCode2,
      config.game.item.mustardMaterialCode3,
    ];

    // 재료 소비
    materialCodes.forEach((materialCode) => {
      const removedItem = this.itemData.find((item) => item.itemCode === materialCode);
      const removedItemIndex = this.itemData.findIndex((item) => item.itemCode === materialCode);
      if (!removedItem) {
        throw new CustomError(
          `코어 보관함에서 아이템을 찾을 수 없습니다. (itemCode:${materialCode})`,
        );
      }

      if (removedItem.count > createCount) {
        removedItem.count -= createCount;
      } else {
        this.itemData.splice(removedItemIndex, 1);
      }
    });

    // 머스타드 생성
    this.putAnItem(null, config.game.item.mustardItemCode, createCount);
    // console.log('허니 머스타드 생성 성공!!');
  }

  removeItem(itemCode, count) {
    const removedItem = this.itemData.find((item) => item.itemCode === itemCode);
    const removedItemIndex = this.itemData.findIndex((item) => item.itemCode === itemCode);
    if (!removedItem) {
      throw new CustomError(`코어 보관함에서 아이템을 찾을 수 없습니다. (itemCode:${itemCode})`);
    }

    if (removedItem.count > count) {
      removedItem.count -= count;
    } else {
      this.itemData.splice(removedItemIndex, 1, 0);
    }
  }
}

export default Core;
