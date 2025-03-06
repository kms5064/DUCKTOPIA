import CustomError from '../../utils/error/customError.js';
import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';

const playerTakeOutAnItemHandler = ({ socket, payload, userId }) => {
  const { itemBoxId, itemCode, count } = payload; //index대신 아이템 종류
  console.log(`takeOutAnItemHandler itemBoxId: ${itemBoxId},itemCode: ${itemCode},count: ${count}`);

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError(`User ID : (${userId}): 유저 정보가 없습니다.`);

  // 룸 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  const player = user.player;

  const itemBox = game.getObjectById(itemBoxId);
  if (!itemBox) throw new CustomError('상자를 찾을 수 없습니다');

  //인벤토리에 빈공간이 있는지
  const checkRoom = (e) => e === 0;
  const emptyIndex = player.inventory.findIndex(checkRoom);

  // 코어
  if (config.game.itemBox.objectCoreCode === itemBoxId) {
    const core = game.getCore();
    if (!core) throw CustomError('코어 정보가 없습니다.');

    const existItem = core.itemData.find((item) => item && item.itemCode === itemCode);
    if (emptyIndex === -1 || !existItem) throw new CustomError('아이템을 꺼낼 수 없습니다');
    const item = core.takeOutAnItem(player, itemCode, count, emptyIndex);

    console.log(`플레이어가 아이템을 꺼냈습니다 ${JSON.stringify(item)}`);
    console.log(`플레이어 인벤토리 ${JSON.stringify(player.inventory)}`);
    console.log(`코어 제조함 인벤토리 ${JSON.stringify(core.itemData)}`);
  } else {
    const itemBox = game.getObjectById(itemBoxId);
    if (!itemBox) throw new CustomError('상자를 찾을 수 없습니다');

    const existItem = itemBox.itemList.find((item) => item && item.itemCode === itemCode);
    if (emptyIndex === -1 || !existItem) throw new CustomError('아이템을 꺼낼 수 없습니다');

    const item = itemBox.takeOutAnItem(player, itemCode, count, emptyIndex);
    console.log(`플레이어가 아이템을 꺼냈습니다 ${JSON.stringify(item)}`);
//     console.log(`플레이어 인벤토리 ${JSON.stringify(player.inventory)}`);
//     console.log(`상자 인벤토리 ${JSON.stringify(itemBox.itemList)}`);
  }

  // 꺼내진 아이템을 success코드와 같이 브로드캐스트 해야한다.
  const playerTakeOutAnItemPayload = {
    playerId: userId,
    itemBoxId: itemBoxId,
    itemData: {
      itemCode: itemCode, //{itemCode:count}
      count: count,
    },
    success: true,
  };

  const notification = [
    config.packetType.S_PLAYER_TAKE_OUT_AN_ITEM_NOTIFICATION,
    playerTakeOutAnItemPayload,
  ];

  game.broadcast(notification);
};

export default playerTakeOutAnItemHandler;
