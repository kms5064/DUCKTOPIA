import CustomError from '../../utils/error/customError.js';
import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';

const playerTakeOutAnItemHandler = ({ socket, payload, userId }) => {
  const { itemBoxId, itemType, count } = payload; //index대신 아이템 종류

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError(`User ID : (${userId}): 유저 정보가 없습니다.`);

  // 룸 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  // 꺼내진 아이템을 success코드와 같이 브로드캐스트 해야한다.
  const playerTakeOutAnItemPayload = {
    playerId: userId,
    // 아직 박스가 1개라서 확정
    itemBoxId: 2,
    itemData: {
      itemId: itemType,
      count: count,
    },
    count: count,
    success: false,
  };

  const packet = [
    config.packetType.S_PLAYER_TAKE_OUT_AN_ITEM_NOTIFICATION,
    playerTakeOutAnItemPayload,
  ];

  game.broadcast(packet);
};

export default playerTakeOutAnItemHandler;
