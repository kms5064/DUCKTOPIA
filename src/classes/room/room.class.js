import { MAX_USER_AMOUNT } from '../../config/constants/room.js';

const RoomStateType = {
  WAIT: 0,
  PREPARE: 1,
  INGAME: 2,
};
Object.freeze(RoomStateType);

class Room {
  constructor(id, name, ownerId) {
    this.users = new Map();
    this.id = id; // 숫자(TODO 나중에 uuid로?)
    this.name = name; // room name
    this.state = RoomStateType.WAIT;
    this.game = null;
    this.ownerId = ownerId;
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

  getRoomData() {
    // 패킷 보내는 용도
    let userDatas = [];

    for (const key of this.users.keys()) {
      // const userData = getUserData();
      //userDatas.push(userData);
    }

    return {
      roomId: this.roomId,
      ownerId: this.ownerId,
      name: this.name,
      maxUserNum: MAX_USER_AMOUNT,
      state: this.state,
      users: userDatas,
    };
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
