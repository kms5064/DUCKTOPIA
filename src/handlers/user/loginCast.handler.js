import { userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

const loginCastHandler = ({ socket, payload }) => {
  const { user, success } = payload;

  if (!user.userId || !user.name || !success) {
    throw new CustomError('올바르지않은 요청입니다.');
  }

  userSession.addUser(user.userId, user.name, socket);

  console.log('들어간 유저들' + userSession.getUserIds());
};

export default loginCastHandler;
