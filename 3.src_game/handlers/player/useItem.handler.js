import { gameSession, userSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';
import { getGameAssets } from '../../init/assets.js';

const useItemHandler = ({ socket, payload, userId }) => {
  const { itemData } = payload;
  // console.log('[아이템 사용 요청]', itemData);

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) return;

  const player = user.player;

  // 게임 객체(세션) 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID: (${user.getGameId()}) Game 정보가 없습니다.`);

  // 아이템 정보 조회
  const itemIndex = player.findItemIndex(itemData.itemCode);
  // console.log('[아이템 정보 조회]', itemIndex);
  if (itemIndex === -1) throw new CustomError('아이템을 찾을 수 없습니다.');

  const item = player.inventory[itemIndex];
  let packet;

  // itemCode로 아이템 타입 판단
  // 아이템 코드 범위에 따라 아이템 타입 판단
  let itemType;
  switch (true) {
    case item.itemCode <= 100:
      itemType = 'FOOD';
      break;
    case item.itemCode <= 200:
      itemType = 'WEAPON';
      break;
    case item.itemCode >= 301 && item.itemCode <= 400:
      itemType = 'TOP';
      break;
    case item.itemCode >= 401 && item.itemCode <= 500:
      itemType = 'BOTTOM';
      break;
    case item.itemCode >= 501 && item.itemCode <= 600:
      itemType = 'SHOES';
      break;
    case item.itemCode >= 601 && item.itemCode <= 700:
      itemType = 'HELMET';
      break;
    case item.itemCode >= 701 && item.itemCode <= 800:
      itemType = 'ACCESSORY';
      break;
    case item.itemCode >= 801:
      itemType = 'etc';
      break;
    default:
      throw new CustomError('알 수 없는 아이템 타입입니다.');
  }

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
      // 플레이어 체력 회복 처리
      const currentHp = player.hp;
      const addHp = Math.min(foodData.hp, player.maxHp - currentHp); // 체력 증가량 계산
      const newHp = player.changePlayerHp(-addHp, game); // 음수로 변경하여 체력 회복

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

    case 'TOP': {
      // 상의 장착 처리
      const equippedArmor = player.equipArmor('top', item.itemCode);
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

    case 'BOTTOM': {
      // 하의 장착 처리
      const equippedArmor = player.equipArmor('bottom', item.itemCode);
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

    case 'SHOES': {
      // 신발 장착 처리
      const equippedArmor = player.equipArmor('shoes', item.itemCode);
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

    case 'HELMET': {
      // 헬멧 장착 처리
      const equippedArmor = player.equipArmor('helmet', item.itemCode);
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

    case 'ACCESSORY': {
      // 액세서리 장착 처리
      const equippedArmor = player.equipArmor('accessory', item.itemCode);
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
      throw new CustomError('알 수 없는 아이템 타입입니다.');
  }

  // 응답 전송
  game.broadcast(packet);
};

export default useItemHandler;
