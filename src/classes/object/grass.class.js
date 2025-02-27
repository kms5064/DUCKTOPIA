import DestructibleObjectBase from '../base/destructibleObjectBase.class';
import { GRASS_MAX_HP ,GRASS_RESPAWN_TIME} from '../../config/constants/objects.js';

class Grass extends DestructibleObjectBase {
  constructor(objectCode) {
    super(objectCode, 6, GRASS_MAX_HP);

    this.isDestroyed = false;
  }

  growBack() {
    if (this.isDestroyed) {
      setTimeout(() => {
        this.hp = this.maxHp;
        this.isDestroyed = false;
        console.log(`Grass: ${this.id} 재생성됨`);
      }, GRASS_RESPAWN_TIME); // 60초 후 다시 생성
    }
  }
}

export default Grass;