import CustomError from '../../utils/error/customError.js';
import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';

const playerCloseBoxHandler = ({ socket, payload, userId }) => {
  const { itemBoxId } = payload;
  console.log(`playerCloseBoxHandler itemBoxId: ${itemBoxId}`);

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError('유저를 찾을 수 없습니다.');

  // 룸 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  const itemBox = game.getItemBoxById(itemBoxId);
  if (!itemBox) throw new CustomError(ErrorCodes.ITEM_BOX_NOT_FOUND, '상자를 찾을 수 없습니다');

  //테스트용 패킷
  const notificationPayload = {
    playerId: userId,
    itemBoxId: itemBoxId,
  };

  const packet = [config.packetType.S_PLAYER_CLOSE_BOX_NOTIFICATION, notificationPayload];
  game.broadcast(packet);
};

export default playerCloseBoxHandler;
