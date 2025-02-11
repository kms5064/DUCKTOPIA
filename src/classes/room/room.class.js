import { config } from '../../config/config.js';
import makePacket from '../../utils/packet/makePacket.js';
import Game from '../game/game.class.js';

const RoomStateType = {
  WAIT: 0,
  PREPARE: 1,
  INGAME: 2,
};
Object.freeze(RoomStateType);

class Room {
  constructor({ id, name, ownerId, maxUserNum }) {
    this.users = new Set();
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
    this.users.add(user);
    console.log(this.users)
    // 플레이어 추가
    this.game.addPlayer(user)
    user.enterRoom(this.id)

    return true;
  }

  // 유저 삭제
  removeUser(user) {
    // 유저 삭제
    this.users.delete(user);
    // 플레이어 삭제
    this.game.removePlayer(user.id);
    user.exitRoom();
  }

  // 방 데이터 추출 (패킷 전송 용도로 가공)
  getRoomData() {
    const usersData = this.getRoomData()

    return {
      roomId: this.id,
      ownerId: this.ownerId,
      name: this.name,
      maxUserNum: this.maxUserAmount,
      state: this.state,
      users: usersData,
    };
  }

  getUserData() {
    const userData = this.game.getGameData()
    return userData
  }

  deleteRoom() {
    const leaveRoomResponse = makePacket(config.packetType.LEAVE_ROOM_RESPONSE, {
      success: true,
    });
    this.broadcast(leaveRoomResponse)
    this.users = null
    this.game = null
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
    this.users.forEach((user) => {
      if (user.id !== id) user.socket.write(packet)
    });
  }

  broadcast(packet) {
    this.users.forEach((user) => {
      user.socket.write(packet)
    });
  }

  getUsersPositionData() {
    const positions = [];
    let i = 1;
    this.game.players.forEach((player, id) => {
      // 새로운 x, y 값 계산
      const newX = i * 3;
      const newY = i * 3;

      // 유저 위치 업데이트
      player.playerPositionUpdate(newX, newY)
      // 업데이트된 위치 정보 반환
      positions.push({
        playerId: id,
        x: player.x, // 업데이트된 값
        y: player.y  // 업데이트된 값
      });
      i++
    });
    return positions
  }

  getPositionUpdateNotification() {
    const roomUsers = Array.from(this.getUsers()); // Iterator → Array
  
    return roomUsers.map(user => user.getpsi()) ;
  }
}

export default Room;
