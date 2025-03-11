import CustomError from '../../utils/error/customError.js';
import { gameSession, userSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';

const playerPutAnItemHandler = ({ socket, payload, userId }) => {
  const { itemBoxId, itemCode, count } = payload;
  // console.log(`putAnItemHandler itemBoxId: ${itemBoxId},itemCode: ${itemCode},count: ${count}`);

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError(`User ID : (${userId}): 유저 정보가 없습니다.`);

  // 룸 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  const player = user.player;

  let item = null;
  let objectDatas = null;
  // 코어
  if (config.game.itemBox.objectCoreCode === itemBoxId) {
    const core = game.getCore();
    if (!core) throw CustomError('코어 정보가 없습니다.');

    // 꿀(itemCode:7), 계란후라이(itemCode:8), 머스타드 씨앗(itemCode:801)이 아니면 넣을 수 없음
    if (
      config.game.item.mustardMaterialCode1 !== itemCode &&
      config.game.item.mustardMaterialCode2 !== itemCode &&
      config.game.item.mustardMaterialCode3 !== itemCode
    ) {
      throw new CustomError(`해당 아이템은 머스타드 제작 재료가 아닙니다. (ItemCode: ${itemCode})`);
    }

    // 1. 제조함에 Item 넣기
    item = core.putAnItem(player, itemCode, count);

    // 2. 제조함 순회해서 재료 개수 확인
    let material1Count = 0;
    let material2Count = 0;
    let material3Count = 0;
    core.itemData.forEach((item) => {
      if (item.itemCode === config.game.item.mustardMaterialCode1) material1Count++;
      else if (item.itemCode === config.game.item.mustardMaterialCode2) material2Count++;
      else if (item.itemCode === config.game.item.mustardMaterialCode3) material3Count++;
    });

    // 3. 머스타드 생성
    if (material1Count > 0 && material2Count > 0 && material3Count > 0) {
      core.createMustardItem([material1Count, material2Count, material3Count]);
    }

    // console.log(`플레이어가 아이템을 넣었습니다 ${JSON.stringify(item)}`);
    // console.log(`플레이어 인벤토리 ${JSON.stringify(player.inventory)}`);
    // console.log(`${itemBoxId} 인벤토리 ${JSON.stringify(core.itemData)}`);

    objectDatas = core.itemData;
  } else {
    // 아이템 박스
    const itemBox = game.getObjectById(itemBoxId);
    if (!itemBox) throw new CustomError('상자를 찾을 수 없습니다');

    const existItem = player.inventory.find((item) => item && item.itemCode === itemCode);
    if (!existItem) throw new CustomError('선택한 아이템을 찾을 수 없습니다');

    item = itemBox.putAnItem(player, itemCode, count);

    console.log(`플레이어가 아이템을 넣었습니다 ${JSON.stringify(item)}`);
    console.log(`플레이어 인벤토리 ${JSON.stringify(player.inventory)}`);
    console.log(`${itemBoxId} 인벤토리 ${JSON.stringify(itemBox.itemList)}`);

    objectDatas = itemBox.itemList;
  }

  if (!item) throw new CustomError(`아이템을 넣는데 실패했습니다`);

  const playerPutAnItemPayload = {
    playerId: userId,
    itemBoxId: itemBoxId,
    itemData: {
      itemCode: itemCode, //{itemCode:count}
      count: count,
    },
    objectDatas: objectDatas,
    success: true,
  };

  const notification = [
    config.packetType.S_PLAYER_PUT_AN_ITEM_NOTIFICATION,
    playerPutAnItemPayload,
  ];

  game.broadcast(notification);
};

export default playerPutAnItemHandler;
