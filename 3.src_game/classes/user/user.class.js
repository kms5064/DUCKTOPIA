import { config } from '../../config/config.js';
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

  getUserData() {
    return {
      userId: this.id,
      name: this.name,
    };
  }

  getPlayerData() {
    return {
      userId: this.id,
      name: this.name,
      character: this.player.getData(),
    };
  }

  getGameId() {
    return this.gameId;
  }

  getSocket() {
    return this.socket;
  }
}

export default User;
