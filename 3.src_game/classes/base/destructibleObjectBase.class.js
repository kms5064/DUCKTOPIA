import { getGameAssets } from '../../init/assets.js';
import { OBJECT_HIT_COUNT } from '../../config/constants/objects.js';

class DestructibleObjectBase {
  constructor(id, objectCode, name, maxHp, x = null, y = null) {
    this.id = id;
    this.objectCode = objectCode;
    //objectCode 1= core, 2~4 = ItemBox, 5 = grass 
    this.name = name;
    this.hp = maxHp;
    this.maxHp = maxHp;
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.dropItems = this.makeDropItem(objectCode);
    this.isDestroyed = false;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  getPosition(){
    return {x:this.x,y:this.y};
  }

  changeObjectHp(damage) {
    this.hp -= Math.max(Math.min(this.hp,damage),1);
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
