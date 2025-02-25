import { roomSession } from '../../../sessions/session.js';

// 방 생성 핸들러
const deleteRoom = (roomId) => {
  console.log(`${roomId} 방 삭제됨`);
  // 2. 방 가져오기
  const room = roomSession.getRoom(+roomId);
  if (!room) return;

  roomSession.removeRoom(room);
};

export default deleteRoom;
