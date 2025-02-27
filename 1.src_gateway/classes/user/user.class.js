import { config } from '../../config/config.js';

class User {
  constructor(socket) {
    this.socket = socket;
    this.id = null; //여기에 유니크 아이디
    this.email = null;
    this.name = null;
    this.gameServer = null;
    this.inGame = false; // 게임 진행 여부 확인
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

  getGameState() {
    return this.inGame;
  }

  getSocket() {
    return this.socket;
  }
}

export default User;
