import { roomSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

// 방 생성 핸들러
const deleteRoomHandler = async ({ socket, payload, userId }) => {
  // 1. 유저 찾기
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError('유저가 존재하지 않습니다!');

  // 2. 방 가져오기
  const room = roomSession.getRoom(user.getRoomId());
  user.exitRoom();
  if (!room) return;

  // 3. 방장이 룸 삭제
  if (room.ownerId === userId) roomSession.removeRoom(room);
};

export default deleteRoomHandler;
