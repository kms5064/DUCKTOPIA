// 식량 아이템 소모 핸들러

import CustomError from '../../utils/error/customError.js';
import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import { getGameAssets } from '../../init/assets.js';

const eatFoodHandler = ({ socket, payload }) => {
  const { itemId } = payload;

  // 1. 유저 찾기
  const user = userSession.getUser(socket);
  if (!user) {
    throw new CustomError('유저 정보가 없습니다.');
  }

  // 2. 룸 찾기
  const room = roomSession.getRoom(user.roomId);
  if (!room) {
    throw new CustomError('방 정보가 없습니다.');
  }

  // 3. 게임 찾기
  const game = room.getGame();
  if (!game) {
    throw new CustomError('게임 정보가 없습니다.');
  }

  // 4. 플레이어 찾기
  const player = game.getPlayerById(user.id);
  if (!player) {
    throw new CustomError('플레이어 정보가 없습니다.');
  }

  // 5. 게임 에셋에서 식량 아이템 정보 찾기
  const gameAssets = getGameAssets();
  const foodData = gameAssets.food.data;
  const existingFood = foodData.find((food) => food.id === itemId);

  if (!existingFood) {
    throw new CustomError('존재하지 않는 아이템입니다.');
  }

  // 6. 인벤토리에서 아이템 확인
  const hasItem = player.inventory.find((food) => food.id === itemId);
  if (!hasItem) {
    throw new CustomError('유저의 인벤토리에 존재하지 않는 아이템입니다.');
  }

  // 7. 허기짐 스탯 증가 및 아이템 제거
  player.changePlayerHunger(existingFood.hunger);
  player.removeItem(itemId);

  // 8. 응답 패킷 전송
  const eatFoodResponse = makePacket(config.packetType.S_PLAYER_EAT_FOOD_RESPONSE, {
    success: true,
    itemId: itemId,
    playerId: player.id,
    hunger: player.hunger,
  });

  socket.write(eatFoodResponse);
};

export default eatFoodHandler;
