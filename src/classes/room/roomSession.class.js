import Room from './room.class.js';
import { v4 as uuidv4 } from 'uuid';

class RoomSession {
  constructor() {
    this.rooms = new Map(); // key : roomId, value : room
  }

  // 방 추가하기
  addRoom(ownerId, name) {
    const roomId = uuidv4();
    const room = new Room(roomId, name, ownerId);
    this.rooms.set(roomId, room);
    return room;
  }

  // 방 지우기
  removeRoom(roomId) {
    this.rooms.delete(roomId);
  }

  // 방 조회
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  // 방 전체 조회
  getRooms() {
    return this.rooms.values();
  }
}

export default RoomSession;
