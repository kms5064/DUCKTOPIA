import { userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

const logoutCastHandler = ({ socket, payload, userId }) => {
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError('유저를 찾지 못했습니다.');

  userSession.deleteUser(userId);
};

export default logoutCastHandler;
