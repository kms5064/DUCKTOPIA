import { config } from '../../config/config.js';
import makePacket from '../../utils/packet/makePacket.js';
import Game from '../game/game.class.js';

const RoomStateType = {
  WAIT: 0,
  PREPARE: 1,
  PLAY: 2,
};
Object.freeze(RoomStateType);

class Room {
  constructor(id, name, ownerId, maxUserNum) {
    this.users = new Set();
    this.id = id; // 숫자
    this.maxUserAmount = maxUserNum;
    this.name = name; // room name
    this.state = RoomStateType.WAIT;
    this.game = new Game(ownerId);
    this.ownerId = ownerId;
  }

  // 유저 추가
  addUser(user) {
    // 방 인원 검사
    if (this.users.size >= this.maxUserAmount) return false;
    // 유저 추가
    this.users.add(user);
    // 플레이어 추가
    this.game.addPlayer(user);
    user.enterRoom(this.id);

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
    return {
      roomId: this.id,
      ownerId: this.ownerId,
      name: this.name,
      maxUserNum: this.maxUserAmount,
      state: this.state,
      users: this.getUsersData(),
    };
  }

  getUsersData() {
    const usersData = [];

    for (const user of this.users) {
      usersData.push(user.getUserData());
    }

    return usersData;
  }

  getUserData() {
    const userData = this.game.getGameData();
    return userData;
  }

  deleteRoom() {
    let packet
    if (this.game.state === RoomStateType.INGAME) {
      packet = makePacket(config.packetType.S_GAME_OVER_NOTIFICATION, {});
      this.broadcast(packet);
    } 
    const LeaveRoomResponse = makePacket(config.packetType.LEAVE_ROOM_RESPONSE, {
      success: true,
    });

    this.broadcast(LeaveRoomResponse);

    // 인터벌 제거
    if (this.game.gameLoop) this.game.gameEnd();

    // 유저 상태 변경
    for (const user of this.users) {
      user.exitRoom();
    }

    this.users = null;
    this.game = null;
  }

  // 방 상태 변경
  changeState(state) {
    this.state = state;
  }

  // 게임 시작
  startGame() {
    this.changeState(RoomStateType.INGAME);
    setTimeout(() => {
      this.game.gameLoopStart();
    }, 3000);

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

  // 전체 공지(본인 제외)
  notification(id, packet) {
    this.users.forEach((user) => {
      if (user.id !== id) user.socket.write(packet);
    });
  }

  // 전체 공지(본인 포함)
  broadcast(packet) {
    this.users.forEach((user) => {
      user.socket.write(packet);
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
      player.playerPositionUpdate(newX, newY);
      // 업데이트된 위치 정보 반환
      positions.push({
        playerId: id,
        x: player.x, // 업데이트된 값
        y: player.y, // 업데이트된 값
      });
      i++;
    });
    return positions;
  }
}

export default Room;
