import { MAX_USER_AMOUNT } from '../../config/constants/room.js';

class Room {
  constructor(id, name, ownerId, maxUserNum) {
    this.users = new Map();
    this.id = id; // uuid
    this.name = name; // room name
    this.state = 0; // 'waiting', 'running'
    this.game = null;
    this.ownerId = ownerId;
    this.maxUserNum = maxUserNum;
  }

  getRoomData() {
    return {
      roomId: this.id,
      ownerId: this.ownerId,
      name: this.name,
      maxUserNum: this.maxUserNum,
      state: this.state,
      users: Array.from(this.users.values()).map(user => user.getUserData())
    }
  }

  addUser(user) {
    // 방 인원 검사
    if (this.users.size >= MAX_USER_AMOUNT) return;

    // 유저 추가
    this.users.set(user.socket, user);
  }

  removeUser(socket) {
    this.users.delete(socket);
  }

  getUsers() {
    return this.users.values();
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

export default Room;
