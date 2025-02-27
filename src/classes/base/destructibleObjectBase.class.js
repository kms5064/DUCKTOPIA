import { getGameAssets } from '../../init/assets.js';

class DestructibleObjectBase {
  constructor(id, objectCode, maxHp) {
    this.id = id,
    this.objectCode = objectCode,
    this.hp = maxHp,
    this.maxHp = maxHp,
    this.x = 0,
    this.y = 0;
    this.dropItems = this.makeDropItem(objectCode);
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  changeObjectHp(damage) {
    this.hp -= damage;
    return this.hp;
  }

  makeDropItem(objectCode) {
    const dropItems = [];

    const { objectDropTable } = getGameAssets();
    const dropData = objectDropTable.data.find((item) => item.objectCode === objectCode);

    dropData.dropList.forEach((itemCode) => {
      const count = Math.floor(Math.random() * dropData.max);
      dropItems.push({ itemCode: itemCode, count: count });
    });

    return dropItems;
  }
}

export default DestructibleObjectBase;
