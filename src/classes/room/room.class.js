import broadcast from '../../utils/packet/broadcast.js';
import Game from '../game/game.class.js';

const RoomStateType = {
  WAIT: 0,
  PREPARE: 1,
  INGAME: 2,
};
Object.freeze(RoomStateType);

class Room {
  constructor({ id, name, ownerId, maxUserNum }) {
    this.users = new Map();
    this.id = id; // 숫자(TODO 나중에 uuid로?)
    this.maxUserAmount = maxUserNum;
    this.name = name; // room name
    this.state = RoomStateType.WAIT;
    this.game = new Game();
    this.ownerId = ownerId;
  }

  // 유저 추가
  addUser(user) {
    // 방 인원 검사
    if (this.users.size >= this.maxUserAmount) return false;

    // 유저 추가
    this.users.set(user.socket, user);
    user.enterRoom(this.id)
    // 플레이어 추가
    this.game.addPlayer(user)
    return true;
  }

  // 유저 삭제
  removeUser(socket) {
    const user = this.users.get(socket)
    // 유저 삭제
    this.users.delete(socket);
    // 플레이어 삭제
    this.game.delete(user.id);
  }

  // 유저 조회
  getUsers() {
    return this.users.values();
  }

  // 방 데이터 추출 (패킷 전송 용도로 가공)
  getRoomData() {
    const usersData = this.game.getGameData()

    return {
      roomId: this.id,
      ownerId: this.ownerId,
      name: this.name,
      maxUserNum: this.maxUserAmount,
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
  }

  // 게임 종료
  endGame() {
    this.changeState(RoomStateType.WAIT);

    // TODO 게임 삭제

    this.game = null;
  }
  // 게임 조회
  getGame() {
    return this.game;
  }

  notification(id, packet) {
    this.users.forEach((user, socket) => {
      if (user.id !== id) socket.write(packet)
    });
  }

  broadcast(packet) {
    this.users.forEach((user, socket) => {
      socket.write(packet)
    });
  }

  getUsersPositionData() {
    const roomUsers = Array.from(this.getUsers()); // Iterator → Array

    return roomUsers.map((user, index) => {
        // 새로운 x, y 값 계산
        const newX = index * 3;
        const newY = index * 3;

        // 유저 위치 업데이트
        user.posiup(newX, newY);

        // 업데이트된 위치 정보 반환
        return {
            playerId: user.id,
            x: user.x, // 업데이트된 값
            y: user.y  // 업데이트된 값
        };
    });
  }

  getPositionUpdateNotification() {
    const roomUsers = Array.from(this.getUsers()); // Iterator → Array
  
    return roomUsers.map(user => user.getpsi()) ;
  }
}

export default Room;
