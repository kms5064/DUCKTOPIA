import DestructibleObjectBase from '../base/destructibleObjectBase.class.js';
import { getGameAssets } from '../../init/assets.js';

class Wall extends DestructibleObjectBase {
  constructor(id, objectCode, x, y) {
    const { objectDropTable } = getGameAssets();
    const { name, maxHp } = objectDropTable.data.find((e) => e.objectCode === objectCode);
    super(id, objectCode, name, maxHp, x, y);
  }
}

export default Wall;
