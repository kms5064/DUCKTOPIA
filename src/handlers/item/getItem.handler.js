import makePacket from '../../utils/packet/makePacket.js';
import { roomSession, userSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';

const getItemHandler = ({ socket, payload }) => {
  const { itemId, playerId } = payload;
  console.log(`[아이템 습득 시도] 플레이어 ID: ${playerId}, 아이템 ID: ${itemId}`);

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

  // 아이템 조회
  const item = game.itemManager.getItem(itemId);
  if (!item) {
    console.log(`[아이템 습득 실패] 아이템(${itemId})이 존재하지 않음`);
    const failPacket = makePacket(config.packetType.S_PLAYER_GET_ITEM_NOTIFICATION, {
      success: false,
      message: '아이템이 존재하지 않습니다.',
      items: [],
    });
    socket.write(failPacket);
    return;
  }

  // 아이템이 이미 습득되었는지 확인
  if (item.isPickedUp) {
    console.log(`[아이템 습득 실패] 아이템(${itemId})이 이미 습득됨`);
    const failPacket = makePacket(config.packetType.S_PLAYER_GET_ITEM_NOTIFICATION, {
      success: false,
      message: '이미 습득된 아이템입니다.',
      items: [],
    });
    socket.write(failPacket);
    return;
  }

  // 아이템과 플레이어 거리 확인 (예: 2유닛 이내)
  const playerPos = player.getPlayerPos();
  const itemPos = item.position;
  const distance = Math.sqrt(
    Math.pow(playerPos.x - itemPos.x, 2) + Math.pow(playerPos.y - itemPos.y, 2),
  );

  if (distance > config.game.item.pickupRange) {
    console.log(`[아이템 습득 실패] 아이템(${itemId})과의 거리(${distance})가 너무 멈`);
    const failPacket = makePacket(config.packetType.S_PLAYER_GET_ITEM_NOTIFICATION, {
      success: false,
      message: '아이템과의 거리가 너무 멉니다.',
      items: [],
    });
    socket.write(failPacket);
    return;
  }

  // 아이템 습득 처리
  const pickupSuccess = item.pickup();
  if (pickupSuccess) {
    // 플레이어 인벤토리에 추가
    player.addItem(item);
    console.log(`[아이템 습득 성공] 플레이어(${playerId})가 아이템(${itemId}) 습득`);

    // 필드에서 아이템 제거
    game.itemManager.removeItem(itemId);

    // 습득 성공 알림 (모든 플레이어에게)
    const successPacket = makePacket(config.packetType.S_PLAYER_GET_ITEM_NOTIFICATION, {
      success: true,
      message: '아이템을 습득했습니다.',
      items: [item],
    });
    game.broadcast(successPacket);
  }
};

export default getItemHandler;
