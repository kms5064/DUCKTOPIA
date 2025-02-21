import makePacket from '../../utils/packet/makePacket.js';
import { roomSession, userSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import Item from '../../classes/item/item.class.js';
import { getGameAssets } from '../../init/assets.js';

const useItemHandler = ({ socket, payload }) => {
  const { itemCode } = payload;
  console.log('[아이템 사용 요청]', payload);

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

  // 아이템 정보 조회
  const player = game.getPlayer(user.getUserData().userId);
  // const itemIndex = player.findItemIndex(itemId);

  // if (itemIndex === -1) {
  //   throw new Error('아이템을 찾을 수 없습니다.');
  // }

  // const item = player.inventory[itemIndex];
  let packet;
  // const playerId = user.getUserData().userId;

  // 아이템 타입에 따라 다른 처리
  // switch (item.type) {
  //   case Item.Type.FOOD: {
      // food.json에서 해당 아이템의 hunger 값을 가져옴
      // const { food } = getGameAssets();
      // const foodData = food.data.find((f) => f.code === item.code);

      // if (!foodData) {
      //   throw new Error('음식 데이터를 찾을 수 없습니다.');
      // }

      // 식량 사용 처리 - changePlayerHunger 메서드 사용
      // const currentHunger = player.hunger;
      // const addHunger = Math.min(foodData.hunger, 100 - currentHunger); // 최대값을 넘지 않도록 계산
      // const newHunger = player.changePlayerHunger(addHunger);
      if(itemCode < 21){
        packet = makePacket(config.packetType.S_PLAYER_EAT_FOOD_RESPONSE, {
          success: true,
          itemCode,
          playerId: player.user.Id,
          hunger: 100,
        });
      }
    //   break;
    // }

    // case Item.Type.WEAPON: {
      // 무기 장착 처리
      // player.equipWeapon(item);
      if(itemCode>21 && itemCode<300)
      packet = makePacket(config.packetType.S_PLAYER_EQUIP_WEAPON_RESPONSE, {
        success: true,
        itemCode,
        playerId: player.user.Id,
      });
  //     break;
  //   }

  //   default:
  //     throw new Error('알 수 없는 아이템 타입입니다.');
  // }

  // 아이템 사용 후 인벤토리에서 제거
  // player.removeItem(itemId);

  // 응답 전송
  game.broadcast(packet);
};

export default useItemHandler;
