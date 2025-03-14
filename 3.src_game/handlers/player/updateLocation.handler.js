import { gameSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

const updateLocationHandler = ({ socket, payload, userId }) => {
  const { x, y } = payload;

  const user = userSession.getUser(userId);
  if (!user) return;

  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  user.player.changePlayerPos(x, y);
};

export default updateLocationHandler;
