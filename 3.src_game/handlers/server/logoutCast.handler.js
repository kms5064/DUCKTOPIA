import { userSession, gameSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

const logoutCastHandler = ({ socket, payload, userId }) => {
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError('유저를 찾지 못했습니다.');

  const game = gameSession.getGame(user.gameId);

  userSession.deleteUser(userId);
  if (game) {
    gameSession.removeGame(game, userId);
  }
};

export default logoutCastHandler;
