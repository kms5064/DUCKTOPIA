import { gameSession, userSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';

const useItemHandler = ({ socket, payload, userId }) => {
  const { itemData } = payload;
  console.log('[아이템 사용 요청]', itemData);

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError(`User ID (${userId}): 유저 정보가 없습니다.`);

  const player = user.player;
  console.log('[플레이어 정보 조회]', player);
  console.log('[플레이어 인벤토리 조회]', player.inventory);

  // 룸 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID: (${user.getGameId()}) Game 정보가 없습니다.`);

  // 아이템 정보 조회
  const itemIndex = player.findItemIndex(itemData.itemCode);
  console.log('[아이템 정보 조회]', itemIndex);
  if (itemIndex === -1) throw new CustomError('아이템을 찾을 수 없습니다.');

  const item = player.inventory[itemIndex];
  let packet;

  const itemType = item.itemCode <= 100 ? 'FOOD' : 'WEAPON';

  // 아이템 타입에 따라 다른 처리
  switch (itemType) {
    case 'FOOD': {
      // food.json에서 해당 아이템의 hunger 값을 가져옴
      const { food } = getGameAssets();
      const foodData = food.data.find((f) => f.code === item.itemCode);
      if (!foodData) throw new CustomError('음식 데이터를 찾을 수 없습니다.');

      // 식량 사용 처리 - changePlayerHunger 메서드 사용
      const currentHunger = player.hunger;
      const addHunger = Math.min(foodData.hunger, player.maxHunger - currentHunger); // 허기 증가량 계산
      const newHunger = player.changePlayerHunger(addHunger);

      // 아이템 개수 감소 (1개만 사용)
      player.removeItem(item.itemCode, 1);

      console.log(
        `[기존 허기]: ${currentHunger} / [허기 증가량]: ${addHunger} / [현재 허기]: ${newHunger}`,
      );
      console.log('[식량 사용 후 인벤토리]', player.inventory);

      // 플레이어 체력 회복 처리
      const currentHp = player.hp;
      const addHp = Math.min(foodData.hp, player.maxHp - currentHp); // 체력 증가량 계산
      const newHp = player.changePlayerHp(-addHp); // 음수로 변경하여 체력 회복
      console.log('[식량 사용 후 체력]', newHp);

      packet = [
        config.packetType.S_PLAYER_EAT_FOOD_RESPONSE,
        {
          success: true,
          itemData: {
            itemCode: item.itemCode,
            count: 1, // 사용한 아이템 개수는 1개
          },
          playerId: userId,
          hunger: newHunger,
          playerHp: newHp,
        },
      ];
      break;
    }

    case 'WEAPON': {
      // 무기 장착 처리
      player.equipWeapon(item.itemCode);

      packet = [
        config.packetType.S_PLAYER_EQUIP_WEAPON_RESPONSE,
        {
          success: true,
          itemData: item,
          playerId: userId,
        },
      ];
      break;
    }

    default:
      throw new Error('알 수 없는 아이템 타입입니다.');
  }

  // 응답 전송
  game.broadcast(packet);
};

export default useItemHandler;
