import makePacket from '../../utils/packet/makePacket.js';
import { roomSession, userSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';

const getItemHandler = ({ socket, payload }) => {
  const { position, playerId } = payload;
  console.log(`[아이템 습득 시도] 플레이어 ID: ${playerId}, 아이템 위치: ${position}`);

  // 유저 객체 조회
  const user = userSession.getUser(socket.id);
  if (!user) {
    throw new CustomError('유저 정보가 없습니다.');
  }

  // RoomId 조회
  const roomId = user.getRoomId();
  if (!roomId) {
    throw new CustomError(`User(${user.id}): RoomId 가 없습니다.`);
  }

  // 룸 객체 조회
  const room = roomSession.getRoom(roomId);
  if (!room) {
    throw new CustomError(`Room ID(${roomId}): Room 정보가 없습니다.`);
  }

  // 게임 객체(세션) 조회
  const game = room.getGame();
  if (!game) {
    throw new CustomError(`Room ID(${roomId}): Game 정보가 없습니다.`);
  }

  // 플레이어 객체 조회
  const player = game.getPlayerById(playerId);
  if (!player) {
    throw new CustomError(`플레이어(${playerId}) 정보를 찾을 수 없습니다.`);
  }

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

  // 가까운 아이템이 없는 경우
  if (!nearestItem) {
    console.log(
      `[아이템 습득 실패] 해당 위치(${position.x}, ${position.y})에서 아이템을 찾을 수 없음`,
    );
    const failPacket = makePacket(config.packetType.S_PLAYER_GET_ITEM_NOTIFICATION, {
      success: false,
      message: '해당 위치에서 아이템을 찾을 수 없습니다.',
      item: null,
      playerId,
    });
    socket.write(failPacket);
    return;
  }

  // 아이템이 이미 습득되었는지 확인
  if (nearestItem.isPickedUp) {
    console.log(`[아이템 습득 실패] 아이템이 이미 습득됨`);
    const failPacket = makePacket(config.packetType.S_PLAYER_GET_ITEM_NOTIFICATION, {
      success: false,
      message: '이미 습득된 아이템입니다.',
      item: null,
      playerId,
    });
    socket.write(failPacket);
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
    const failPacket = makePacket(config.packetType.S_PLAYER_GET_ITEM_NOTIFICATION, {
      success: false,
      message: '아이템과의 거리가 너무 멉니다.',
      item: null,
      playerId,
    });
    socket.write(failPacket);
    return;
  }

  // 아이템 습득 처리
  try {
    // 플레이어 인벤토리에 추가
    player.addItem(nearestItem.itemData.itemCode, nearestItem.itemData.count, -1);
    console.log(`[아이템 습득 성공] 플레이어(${playerId})가 아이템(${nearestItem.itemId}) 습득`);

    // 인벤토리 상태 로깅
    console.log(`[인벤토리 상태]`);
    console.log(
      `- 습득한 아이템: 코드=${nearestItem.itemData.itemCode}, 개수=${nearestItem.itemData.count}`,
    );
    const inventoryItem = player.inventory.find(
      (item) => item && item.itemCode === nearestItem.itemData.itemCode,
    );
    if (inventoryItem) {
      console.log(
        `- 인벤토리 아이템 현황: 코드=${inventoryItem.itemCode}, 현재 개수=${inventoryItem.count}`,
      );
    } else {
      console.log(`- 인벤토리에서 아이템을 찾을 수 없음`);
    }
    console.log('[전체 인벤토리]', player.inventory);

    // 필드에서 아이템 제거
    game.itemManager.removeFieldDropItem(nearestItem.itemId);

    // 필드 아이템 상태 로깅
    const remainingItems = game.itemManager.getAllFieldDropItems();
    console.log(
      '\n[필드 아이템 현황]',
      remainingItems.map((item) => ({
        itemCode: item.itemData.itemCode,
        position: item.position,
      })),
    );

    // 습득 성공 알림 (모든 플레이어에게)
    const successPacket = makePacket(config.packetType.S_PLAYER_GET_ITEM_NOTIFICATION, {
      success: true,
      message: '아이템을 습득했습니다.',
      item: nearestItem,
      playerId,
    });
    game.broadcast(successPacket);
  } catch (error) {
    console.error('[아이템 습득 실패]', error);
    const failPacket = makePacket(config.packetType.S_PLAYER_GET_ITEM_NOTIFICATION, {
      success: false,
      message: '아이템 습득에 실패했습니다.',
      item: null,
      playerId,
    });
    socket.write(failPacket);
  }
};

export default getItemHandler;
