import makePacket from '../../utils/packet/makePacket.js';
import Player from '../game/player.class.js';

class User {
  constructor(id, name, gameId, socket) {
    this.socket = socket;
    this.id = id;
    this.name = name;
    this.gameId = gameId;
    this.player = new Player(this.id, 10, 0, 0);
  }

  sendPacket([packetType, payload]) {
    const packet = makePacket(packetType, payload, this.id);
    this.socket.write(packet);
  }

  getGameId() {
    return this.gameId;
  }
}

export default User;
