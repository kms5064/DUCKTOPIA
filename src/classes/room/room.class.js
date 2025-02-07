import { MAX_USER_AMOUNT } from '../../config/constants/room.js';

class Room {
  constructor(ownerId) {
    this.users = new Map();
    this.state = 'waiting'; // 'waiting', 'running'
    this.game = null;
    this.ownerId = ownerId;
  }

  addUser(user) {
    // 방 인원 검사
    if (this.users.size >= MAX_USER_AMOUNT) return;

    // 유저 추가
    this.users.set(user.socket, user);
  }

  changeState(state) {
    this.state = state;
  }

  startGame() {
    this.changeState('running');

    // TODO 게임 추가
    this.game = new Game();
  }

  endGame() {
    this.changeState('waiting');

    // TODO 게임 삭제

    this.game = null;
  }
}
