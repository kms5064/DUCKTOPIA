import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

const updateLocationHandler = ({ socket, payload, userId }) => {
  const { x, y } = payload;

  const user = userSession.getUser(userId);
  if (!user) throw new CustomError('유저 정보가 없습니다.');

  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  const updatePositionNotification = user.player.calculatePosition(x, y);

  // payload 인코딩
  const packet = [
    config.packetType.S_PLAYER_POSITION_UPDATE_NOTIFICATION,
    {
      playerPositions: [updatePositionNotification],
    },
  ];

  // 룸 내 인원에게 브로드캐스트
  game.broadcast(packet);
};

export default updateLocationHandler;
