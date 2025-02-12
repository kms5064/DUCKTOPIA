import Room from './room.class.js';

class RoomSession {
  constructor() {
    this.rooms = new Map(); // key : roomId, value : room
    this.game = null;
    this.newId = 1;
  }

  // 방 추가하기
  addRoom(ownerId, name, maxUserNum) {
    //const roomId = uuidv4();
    const roomId = this.newId; // TODO(나중에 복구?)
    const room = new Room({ id: roomId, name, ownerId, maxUserNum });
    this.rooms.set(roomId, room);

    this.newId += 1;
    return room;
  }

  // 방 지우기
  removeRoom(room) {
    room.deleteRoom()
    this.rooms.delete(room.id);
  }

  // 방 조회
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getRoomBySocket(socket)
  {
    for(const [key, room] of this.rooms)
    {
      const havingRoom = room.findGameBySocket(socket);
      if(!havingRoom)
      {
        continue;
      }
      else
      {
        return havingRoom;
      }
    }
  }

  // 방 전체 조회
  getRooms() {
    return this.rooms.values();
  }

  // 방 전체 정보 추출 (패킷 전송 용도로 가공)
  getRoomsData() {
    const roomsData = [];
    for (const room of this.getRooms()) {
      roomsData.push(room.getRoomData());
    }

    return roomsData;
  }

  gameStart()
  {
    const id = uuidv4();
    
  }
}

export default RoomSession;
