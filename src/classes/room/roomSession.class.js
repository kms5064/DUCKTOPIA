import Room from './room.class.js';
import { v4 as uuidv4 } from 'uuid';

class RoomSession {
  constructor() {
    this.rooms = new Map(); // key : roomId, value : room
    this.roomIdCounter = 1;
  }

  // 방 추가하기
  addRoom(ownerId, name, maxUserNum) {
   
    const room = new Room(this.roomIdCounter++, name, ownerId, maxUserNum);
    this.rooms.set(this.roomIdCounter, room);
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

  getRoomsData() {
    return {
      rooms: Array.from(this.rooms.values()).map(room => room.getRoomData())
    };
  }
}

export default RoomSession;
