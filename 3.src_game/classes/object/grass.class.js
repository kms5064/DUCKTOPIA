import DestructibleObjectBase from '../base/destructibleObjectBase.class.js';
import { GRASS_MAX_HP ,GRASS_RESPAWN_TIME} from '../../config/constants/objects.js';
import { getGameAssets } from '../../init/assets.js';


class Grass extends DestructibleObjectBase {
  constructor(id) {
    const { objectDropTable } = getGameAssets()
    const { name, maxHp } = objectDropTable.data.find((e) => e.objectCode === 5);
    super(id, 5, name, maxHp);
  }

  growBack() {
    if (this.isDestroyed) {
      setTimeout(() => {
        this.hp = this.maxHp;
        this.isDestroyed = false;
        // console.log(`Grass: ${this.id} 재생성됨`);
      }, GRASS_RESPAWN_TIME); // 60초 후 다시 생성
    }
  }
}

export default Grass;