import { getGameAssets } from '../../init/assets.js';
import { OBJECT_HIT_COUNT } from '../../config/constants/objects.js';

class DestructibleObjectBase {
  constructor(id, objectCode, name) {
    this.id = id;
    this.objectCode = objectCode;
    //objectCode 1= core, 2~4 = ItemBox, 5 = grass 
    this.name = name;
    this.hp = OBJECT_HIT_COUNT;
    this.maxHp = OBJECT_HIT_COUNT;
    this.x = 0;
    this.y = 0;
    this.dropItems = this.makeDropItem(objectCode);
    this.isDestroyed = false;
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
