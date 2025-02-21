import { config } from '../../config/config.js';
import makePacket from '../../utils/packet/makePacket.js';

class Object {
  constructor(id) {
    this.id = id;
    this.hp = config.game.object.maxHP;
    this.x = 0;
    this.y = 0;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  takeDamage(damage, game) {
    this.hp -= damage;

    if (this.hp <= 0) {
      this.hp = 0;
    }

    const objectHpPacket = makePacket(config.packetType.S_OBJECT_HP_UPDATE_NOTIFICATION, {
      objectId: this.id,
      hp: this.hp,
    });

    game.broadcast(objectHpPacket);

    // 오브젝트 제거 처리
    if (this.hp === 0) {
      game.removeObject(this.id);
    }
  }
}

export default Object;
