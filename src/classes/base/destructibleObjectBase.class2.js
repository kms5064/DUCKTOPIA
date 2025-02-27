import { getGameAssets } from '../../init/assets.js';

class DestructibleObjectBase {
  //파밍용 오브젝트들 코드별로 분류해서 hp와 드랍템 설정하는 json파일 만들어야 할듯
  constructor(id, objectCode, maxHp) {
    (this.id = id),
      (this.objectCode = objectCode),
      (this.hp = maxHp),
      (this.maxHp = maxHp),
      (this.x = 0),
      (this.y = 0);
    // this.dropItem = Array.from({ length: 4 }, () => 0);
    this.dropItem = this.makeDropItem(objectCode);
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
    const dropItems = Array.from({ length: 4 }, () => 0);

    const { objectDropTable } = getGameAssets();
    const dropData = objectDropTable.data.find((item) => item.objectCode === objectCode);

    dropData.dropList.forEach((data) => {
      data.dropList.forEach((itemCode) => {
        const count = Math.floor(Math.random() * dropData.max);
        dropItems.push({ itemCode: itemCode, count: count });
      });
    });

    //비즈니스 로직
    return dropItems;
  }
}

export default DestructibleObjectBase;
