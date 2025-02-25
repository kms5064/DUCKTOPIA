// 식량 아이템 소모 핸들러

import CustomError from '../../utils/error/customError.js';
import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import { getGameAssets } from '../../init/assets.js';

const eatFoodHandler = ({ socket, payload, userId }) => {
  const { itemId } = payload;

  // 1. 유저 찾기
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError('유저 정보가 없습니다.');

  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  // 5. 게임 에셋에서 식량 아이템 정보 찾기
  const gameAssets = getGameAssets();
  const foodData = gameAssets.food.data;
  const existingFood = foodData.find((food) => food.id === itemId);

  if (!existingFood) {
    throw new CustomError('존재하지 않는 아이템입니다.');
  }

  // 6. 인벤토리에서 아이템 확인
  const hasItem = user.player.inventory.find((food) => food.id === itemId);
  if (!hasItem) {
    throw new CustomError('유저의 인벤토리에 존재하지 않는 아이템입니다.');
  }

  // 7. 허기짐 스탯 증가 및 아이템 제거
  user.player.changePlayerHunger(existingFood.hunger);
  user.player.removeItem(itemId);

  // 8. 응답 패킷 전송
  const packet = [
    config.packetType.S_PLAYER_EAT_FOOD_RESPONSE,
    {
      success: true,
      itemId: itemId,
      playerId: user.player.id,
      hunger: user.player.hunger,
    },
  ];

  socket.write(packet);
};

export default eatFoodHandler;
