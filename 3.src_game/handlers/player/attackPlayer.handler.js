import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

const attackPlayerHandler = ({ socket, payload, userId }) => {
  const { playerDirX, playerDirY } = payload;

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError('유저 정보가 없습니다.');

  // 룸 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  // Notification - 다른 플레이어들에게 전달
  const packet = [
    config.packetType.S_PLAYER_ATTACK_NOTIFICATION,
    { playerId: userId, playerDirX, playerDirY },
  ];
  game.notification(userId, packet);
};

export default attackPlayerHandler;
