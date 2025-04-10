import { config } from '../../config/config.js';
import { roomSession } from '../../sessions/session.js';

const RoomStateType = {
  WAIT: 0,
  PREPARE: 1,
  PLAY: 2,
};
Object.freeze(RoomStateType);

class Room {
  constructor(id, name, ownerId, maxUserNum) {
    this.users = new Map();
    this.id = id; // 숫자
    this.maxUserAmount = maxUserNum;
    this.name = name; // room name
    this.state = RoomStateType.WAIT;
    this.ownerId = ownerId;
    // 10분 이내에 게임 시작 안할 시 자동 삭제
    this.timeout = setTimeout(this.timeCheck, 600000);
  }

  timeCheck = () => {
    if (this.state === RoomStateType.PLAY) return;

    roomSession.removeRoom(this);
  };

  // 유저 추가
  addUser(user) {
    // 방 인원 검사
    if (this.users.size >= this.maxUserAmount || this.state !== 0) return false;
    // 유저 추가
    this.users.set(user.id, user);
    user.enterRoom(this.id);

    return true;
  }

  getUserIds() {
    const userIds = [];

    this.users.forEach((user) => {
      userIds.push(user.id);
    });

    return userIds;
  }

  // 유저 삭제
  removeUser(user) {
    // 유저 삭제
    this.users.delete(user.id);
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

    for (const [id, user] of this.users) {
      usersData.push(user.getUserData());
    }

    return usersData;
  }

  deleteRoom() {
    if (this.state !== RoomStateType.PLAY) {
      const leaveRoomResponse = [
        config.packetType.LEAVE_ROOM_RESPONSE,
        {
          success: true,
        },
      ];
      this.broadcast(leaveRoomResponse);
    }

    // 유저 상태 변경
    for (const [id, user] of this.users) {
      user.exitRoom();
    }

    this.users = null;
  }

  // 게임 시작
  startGame() {
    this.state = RoomStateType.PLAY;
  }

  // 전체 공지(본인 제외)
  notification(id, packetInfos) {
    this.users.forEach((user) => {
      if (user.id !== id) user.sendPacket(packetInfos);
    });
  }

  // 전체 공지(본인 포함)
  broadcast(packetInfos) {
    this.users.forEach((user) => {
      user.sendPacket(packetInfos);
    });
  }
}

export default Room;
