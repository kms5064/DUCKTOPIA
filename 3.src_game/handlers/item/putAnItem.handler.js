import CustomError from '../../utils/error/customError.js';
import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';

const playerPutAnItemHandler = ({ socket, payload, userId }) => {
  const { itemBoxId, itemCode, count } = payload;
  console.log(`putAnItemHandler itemBoxId: ${itemBoxId},itemCode: ${itemCode},count: ${count}`);

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError(`User ID : (${userId}): 유저 정보가 없습니다.`);

  // 룸 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  const player = user.player;

  const itemBox = game.getItemBoxById(itemBoxId);
  if (!itemBox) throw new CustomError('상자를 찾을 수 없습니다');

  const existItem = player.inventory.find((item) => item && item.itemCode === itemCode);
  if (!existItem) throw new CustomError('선택한 아이템을 찾을 수 없습니다');

  const item = itemBox.putAnItem(player, itemCode, count);
  console.log(`플레이어가 아이템을 넣었습니다 ${JSON.stringify(item)}`);
  // console.log(`플레이어 인벤토리 ${JSON.stringify(player.inventory)}`);
  // console.log(`상자 인벤토리 ${JSON.stringify(itemBox.itemList)}`);

  if (!item) throw new CustomError(`아이템을 넣는데 실패했습니다`);

  const playerPutAnItemPayload = {
    playerId: userId,
    itemBoxId: itemBoxId,
    itemData: {
      itemCode: itemCode, //{itemCode:count}
      count: count,
    },
    success: true,
  };

  const notification = [
    config.packetType.S_PLAYER_PUT_AN_ITEM_NOTIFICATION,
    playerPutAnItemPayload,
  ];

  game.broadcast(notification);
};

export default playerPutAnItemHandler;
