import makePacket from '../../utils/packet/makePacket.js';
import { roomSession, userSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import Item from '../../classes/item/item.class.js';
import { getGameAssets } from '../../init/assets.js';

const useItemHandler = ({ socket, payload }) => {
  const { itemData } = payload;
  console.log('[아이템 사용 요청]', itemData);

  // 유저 객체 조회
  const user = userSession.getUser(socket.id);
  if (!user) {
    throw new Error('유저 정보가 없습니다.');
  }

  // RoomId 조회
  const roomId = user.getRoomId();
  if (!roomId) {
    throw new Error(`User(${user.id}): RoomId 가 없습니다.`);
  }

  // 룸 객체 조회
  const room = roomSession.getRoom(roomId);
  if (!room) {
    throw new Error(`Room ID(${roomId}): Room 정보가 없습니다.`);
  }

  // 게임 객체(세션) 조회
  const game = room.getGame();
  if (!game) {
    throw new Error(`Room ID(${roomId}): Game 정보가 없습니다.`);
  }

  // 플레이어 객체 조회
  const player = game.getPlayerById(user.getUserData().userId);
  console.log('[플레이어 정보 조회]', player);
  console.log('[플레이어 인벤토리 조회]', player.inventory);

  // 아이템 정보 조회
  const itemIndex = player.findItemIndex(itemData.itemCode);
  console.log('[아이템 정보 조회]', itemIndex);

  if (itemIndex === -1) {
    throw new Error('아이템을 찾을 수 없습니다.');
  }

  const item = player.inventory[itemIndex];
  let packet;
  const playerId = user.getUserData().userId;

  // itemCode로 아이템 타입 판단
  const itemType = item.itemCode <= 100 ? 'FOOD' : 'WEAPON';

  // 아이템 타입에 따라 다른 처리
  switch (itemType) {
    case 'FOOD': {
      // food.json에서 해당 아이템의 hunger 값을 가져옴
      const { food } = getGameAssets();
      const foodData = food.data.find((f) => f.code === item.itemCode);

      if (!foodData) {
        throw new Error('음식 데이터를 찾을 수 없습니다.');
      }

      // 식량 사용 처리 - changePlayerHunger 메서드 사용
      const currentHunger = player.hunger;
      const addHunger = Math.min(foodData.hunger, player.maxHunger - currentHunger); // 허기 증가량 계산
      const newHunger = player.changePlayerHunger(addHunger);

      player.removeItem(item.itemCode, item.count);

      console.log(
        `[기존 허기]: ${currentHunger} / [허기 증가량]: ${addHunger} / [현재 허기]: ${newHunger}`,
      );
      console.log('[식량 사용 후 인벤토리]', player.inventory);

      // 플레이어 체력 회복 처리
      const currentHp = player.hp;
      const addHp = Math.min(foodData.hp, player.maxHp - currentHp); // 체력 증가량 계산
      const newHp = player.healPlayerHp(addHp);
      console.log('[식량 사용 후 체력]', newHp);

      packet = makePacket(config.packetType.S_PLAYER_EAT_FOOD_RESPONSE, {
        success: true,
        itemData: item,
        playerId,
        hunger: newHunger,
        playerHp: newHp,
      });
      break;
    }

    case 'WEAPON': {
      // 무기 장착 처리
      player.equipWeapon(item.itemCode);

      packet = makePacket(config.packetType.S_PLAYER_EQUIP_WEAPON_RESPONSE, {
        success: true,
        itemData: item,
        playerId,
      });
      break;
    }

    default:
      throw new Error('알 수 없는 아이템 타입입니다.');
  }

  // 응답 전송
  game.broadcast(packet);
};

export default useItemHandler;
