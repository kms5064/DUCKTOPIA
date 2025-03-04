import makePacket from '../../utils/packet/makePacket.js';
import { gameSession, userSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';

const getItemHandler = ({ socket, payload, userId }) => {
  const { position, playerId } = payload;
  // console.log(`[아이템 습득 시도] 플레이어 ID: ${playerId}, 아이템 위치: ${position}`);

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError('유저 정보가 없습니다.');

  // 게임 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  const player = user.player;

  // 필드에 있는 모든 아이템 조회
  const fieldItems = game.itemManager.getAllFieldDropItems();

  // 주어진 위치에서 가장 가까운 아이템 찾기
  let nearestItem = null;
  let minDistance = Infinity;

  fieldItems.forEach((item) => {
    const distance = Math.sqrt(
      Math.pow(position.x - item.position.x, 2) + Math.pow(position.y - item.position.y, 2),
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestItem = item;
    }
  });

  // 예외 로직

  const sendFailMessage = (message) => {
    const failPacket = [
      config.packetType.S_PLAYER_GET_ITEM_NOTIFICATION,
      {
        success: false,
        message,
        item: null,
        playerId: userId,
      },
    ];
    user.sendPacket(failPacket);
  };

  if (!nearestItem) {
    console.log(
      `[아이템 습득 실패] 해당 위치(${position.x}, ${position.y})에서 아이템을 찾을 수 없음`,
    );
    sendFailMessage('해당 위치에서 아이템을 찾을 수 없습니다.');
    return;
  }

  if (nearestItem.isPickedUp) {
    console.log(`[아이템 습득 실패] 아이템이 이미 습득됨`);
    sendFailMessage('이미 습득된 아이템입니다.');
    return;
  }

  // 아이템과 플레이어 거리 확인 (예: 2유닛 이내)
  const playerPos = player.getPlayerPos();
  const itemPos = nearestItem.position;
  const distance = Math.sqrt(
    Math.pow(playerPos.x - itemPos.x, 2) + Math.pow(playerPos.y - itemPos.y, 2),
  );

  if (distance > config.game.item.pickupRange) {
    console.log(`[아이템 습득 실패] 아이템과의 거리(${distance})가 너무 멈`);
    sendFailMessage('아이템과의 거리가 너무 멉니다.');
    return;
  }

  // 인벤토리 공간 확인
  const existingItem = player.inventory.find(
    (item) => item && item.itemCode === nearestItem.itemData.itemCode,
  );

  // 같은 종류의 아이템이 없고, 빈 슬롯도 없는 경우
  if (!existingItem) {
    const checkRoom = (ele) => ele === 0;
    const emptyIndex = player.inventory.findIndex(checkRoom);

    if (emptyIndex === -1) {
      console.log(`[아이템 습득 실패] 인벤토리 공간이 부족함`);
      sendFailMessage('인벤토리 공간이 부족합니다.');
      return;
    }
  }

  // 아이템 습득 처리
  try {
    // 플레이어 인벤토리에 추가
    player.addItem(nearestItem.itemData.itemCode, nearestItem.itemData.count, -1);
    console.log(`[아이템 습득 성공] 플레이어(${playerId})가 아이템(${nearestItem.itemId}) 습득`);

    // 인벤토리 상태 로깅
    // console.log(`[인벤토리 상태]`);
    // console.log(
    //   `- 습득한 아이템: 코드=${nearestItem.itemData.itemCode}, 개수=${nearestItem.itemData.count}`,
    // );

    const inventoryItem = player.inventory.find(
      (item) => item && item.itemCode === nearestItem.itemData.itemCode,
    );
    if (inventoryItem) {
      console.log(
        // `- 인벤토리 아이템 현황: 코드=${inventoryItem.itemCode}, 현재 개수=${inventoryItem.count}`,
      );
    } else {
      console.log(`- 인벤토리에서 아이템을 찾을 수 없음`);
    }
    // console.log('[전체 인벤토리]', player.inventory);

    // 필드에서 아이템 제거
    game.itemManager.removeFieldDropItem(nearestItem.itemId);

    // 필드 아이템 상태 로깅
    const remainingItems = game.itemManager.getAllFieldDropItems();
    // console.log(
    //   '\n[필드 아이템 현황]',
    //   remainingItems.map((item) => ({
    //     itemCode: item.itemData.itemCode,
    //     position: item.position,
    //   })),
    // );

    // 습득 성공 알림 (모든 플레이어에게)
    const successPacket = [
      config.packetType.S_PLAYER_GET_ITEM_NOTIFICATION,
      {
        success: true,
        message: '아이템을 습득했습니다.',
        item: nearestItem,
        playerId,
      },
    ];
    game.broadcast(successPacket);
  } catch (error) {
    sendFailMessage('아이템 습득에 실패했습니다.');
    console.error('[아이템 습득 실패]', error);
  }
};

export default getItemHandler;
