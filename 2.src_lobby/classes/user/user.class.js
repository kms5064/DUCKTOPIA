import makePacket from '../../utils/packet/makePacket.js';

class User {
  constructor(userId, userName, socket) {
    this.socket = socket;
    this.id = userId; //여기에 유니크 아이디
    this.name = userName;
    this.state = 'lobby'; // 'lobby', 'room', 'playing' 등 현재 상태 체크용
    this.roomId = null; // game이 room 안에 있으므로 여기서 찾을 수 있습니다!
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

  // 방 입장
  enterRoom(roomId) {
    this.roomId = roomId;
    this.state = 'room';
  }

  // 게임 시작
  gameStart() {
    this.state = 'playing';
  }

  // 방 퇴장
  exitRoom() {
    this.roomId = null;
    this.state = 'lobby';
  }
}

export default User;
