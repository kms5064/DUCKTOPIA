// 식량 아이템 소모 핸들러
//! 추후에 Player 클래스 대신 gameSession 내에 어떤 것 들고와서 사용해야 함.
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import Player from '../../classes/player/player.class';
import { getGameAssets } from '../../init/assets';
import { errorHandler } from '../../utils/error/errorHandler.js';
import { PACKET_TYPE } from '../../config/constants/header.js';

const eatFoodHandler = (socket, sequence, payload) => {
  // payload에서 식량 아이템 고유 번호 및 플레이어 아이디를 받아와야 한다.
  const { foodId, playerId } = payload;

  // 게임 에셋을 가져온다.
  const gameAssets = getGameAssets();
  const foodData = gameAssets.food.data;

  // payload로 받아온 식량 고유 번호가 존재하는지 확인한다.
  const existingFood = foodData.find((food) => food.id === foodId);
  if (!existingFood) {
    // throw new Error('존재하지 않는 아이템입니다.');
    throw new CustomError(ErrorCodes.ITEM_NOT_FOUND, '존재하지 않는 아이템입니다.');
  }

  // 해당 아이템이 유저의 인벤토리에 있는지 확인한다.
  if (Player.inventory.find((food) => food.id === foodId)) {
    // 있다면 유저의 허기짐 스탯을 증가 시킨다.
    Player.changePlayerHunger(existingFood.hunger);

    // 유저의 인벤토리에서 해당 아이템을 제거한다.
    Player.removeItem(foodId);
  } else {
    // throw new Error('유저의 인벤토리에 존재하지 않는 아이템입니다.');
    throw new CustomError(
      ErrorCodes.ITEM_NOT_IN_INVENTORY,
      '유저의 인벤토리에 존재하지 않는 아이템입니다.',
    );
  }
};

export default eatFoodHandler;
