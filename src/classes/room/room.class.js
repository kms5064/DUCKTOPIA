import { PACKET_TYPE } from '../../config/constants/header.js';
import { MAX_USER_AMOUNT } from '../../config/constants/room.js';
import makePacket from '../../utils/packet/makePacket.js';

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

  joinRoomNotification(id) {
    const roomUsers = Array.from(this.getUsers());

    const targetUser = roomUsers.find(user => user.id === id);

    const JoinRoomNotification = makePacket(PACKET_TYPE.JOIN_ROOM_NOTIFICATION, {
      joinUser: targetUser.getUserData(), 
  });

  roomUsers.forEach(user => {
    if (user.id !== id && user.socket) {
        user.socket.write(JoinRoomNotification);
    }
});

  }

  joinUserNotification(packet) {
    const roomUsers = Array.from(this.getUsers());

  roomUsers.forEach(user => {
    if (user.socket) {
        user.socket.write(packet);
    }
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

  getUsersData() {
    const roomUsers = Array.from(this.getUsers()); 

    return roomUsers.map(user => user.getUserData()); // 유저 데이터를 배열로 변환
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
