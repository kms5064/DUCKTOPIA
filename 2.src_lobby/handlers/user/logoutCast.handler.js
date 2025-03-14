import { roomSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';
import leaveRoomHandler from '../room/leaveRoom.handler.js';

const logoutCastHandler = ({ socket, payload, userId }) => {
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError('유저를 찾지 못했습니다.');

  const room = roomSession.getRoom(user.roomId);
  if (user.roomId && room.state !== 2) leaveRoomHandler({ socket, payload, userId });
  userSession.deleteUser(userId);
};

export default logoutCastHandler;
