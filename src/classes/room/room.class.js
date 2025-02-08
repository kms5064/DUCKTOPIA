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

  // 유저 추가
  addUser(user) {
    // 방 인원 검사
    if (this.users.size >= MAX_USER_AMOUNT) return false;

    // 유저 추가
    this.users.set(user.socket, user);

    return true;
  }

  // 유저 삭제
  removeUser(socket) {
    this.users.delete(socket);
  }

  // 유저 조회
  getUsers() {
    return this.users.values();
  }

  // 방 데이터 추출 (패킷 전송 용도로 가공)
  getRoomData() {
    let usersData = [];

    for (const user of this.getUsers()) {
      // const userData = user.getUserData();
      // usersData.push(userData);
    }

    return {
      roomId: this.roomId,
      ownerId: this.ownerId,
      name: this.name,
      maxUserNum: MAX_USER_AMOUNT,
      state: this.state,
      users: usersData,
    };
  }

  // 방 상태 변경
  changeState(state) {
    this.state = state;
  }

  // 게임 시작
  startGame() {
    this.changeState(RoomStateType.INGAME);

    // TODO 게임 추가
    this.game = new Game();
  }

  // 게임 종료
  endGame() {
    this.changeState(RoomStateType.WAIT);

    // TODO 게임 삭제

    this.game = null;
  }
}

export default Room;
