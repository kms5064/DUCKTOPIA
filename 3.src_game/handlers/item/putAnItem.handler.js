import CustomError from '../../utils/error/customError.js';
import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';

const playerPutAnItemHandler = ({ socket, payload, userId }) => {
  const { itemBoxId, itemType, count } = payload;

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError(`User ID : (${userId}): 유저 정보가 없습니다.`);

  // 룸 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  const itemBox = game.getItemBoxById(itemBoxId);

  const playerPutAnItemPayload = {
    playerId: userId,
    itemBoxId: 2,
    itemData: {
      itemId: itemType,
      count: count,
    },
    count: count,
    success: false,
  };

  const packet = [config.packetType.S_PLAYER_PUT_AN_ITEM_NOTIFICATION, playerPutAnItemPayload];
  game.broadcast(packet);
};

export default playerPutAnItemHandler;
