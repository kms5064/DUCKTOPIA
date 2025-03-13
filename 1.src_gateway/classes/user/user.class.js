import { config } from '../../config/config.js';
import { redisClient } from '../../db/redis/redis.js';

class User {
  constructor(socket) {
    this.socket = socket;
    this.id = null; //여기에 유니크 아이디
    this.email = null;
    this.name = null;
    this.gameServer = null;
    this.inGame = false; // 게임 진행 여부 확인
    this.loginTime = Date.now();
  }

  getUserData() {
    return {
      userId: this.id,
      name: this.name,
    };
  }

  // 로그인
  login(id, email, name) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.loginTime = Date.now();
  }

  // 로그 아웃
  logout() {
    this.id = null;
    this.email = null;
    this.name = null;
  }

  setGameState(bool, gameServer = null) {
    this.inGame = bool;
    this.gameServer = gameServer;
  }

  async getGameState() {
    if (this.gameServer) return this.inGame;
    
    const serverId = await redisClient.hGet(config.redis.custom + 'Server:User:' + this.id, 'game');
    if (serverId) {
      this.inGame = true;
      this.gameServer = serverId;
    }

    return this.inGame;
  }

  getSocket() {
    return this.socket;
  }
}

export default User;
