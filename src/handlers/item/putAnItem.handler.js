import CustomError from '../../utils/error/customError.js';
import { errorHandler } from '../../utils/error/errorHandler.js';
import { config } from '../../config/config.js';
import makePacket from '../../utils/packet/makePacket.js';
import { userSession } from '../../sessions/session.js';
import { roomSession } from '../../sessions/session.js';

const playerPutAnItemHandler = ({ socket, sequence, payload }) => {
    const { itemBoxId,itemCode, count } = payload;
    console.log(`putAnItemHandler itemBoxId: ${itemBoxId},itemCode: ${itemCode},count: ${count}`);

    // 유저 객체 조회
    const user = userSession.getUser(socket.id);
    if (!user) {
      throw new CustomError('유저를 찾을 수 없습니다.');
    }

    // RoomId 조회
    const roomId = user.getRoomId();
    if (!roomId) {
      throw new CustomError('유저에게서 roodId를 찾을 수 없습니다.');
    }

    // 룸 객체 조회
    const room = roomSession.getRoom(roomId);
    if (!room) {
      throw new CustomError('방을 찾을 수 없습니다.');
    }

    // 게임 객체(세션) 조회
    const game = room.getGame();
    if (!game) {
      throw new CustomError('게임을 찾을 수 없습니다.');
    }

    // 플레이어 객체 조회
    const player = game.getPlayerById(user.id);
    if (!player) {
      throw new CustomError('플레이어를 찾을 수 없습니다');
    }

    const itemBox = game.getItemBoxById(itemBoxId);
    if (!itemBox) {
      throw new CustomError( '상자를 찾을 수 없습니다');
    }

    const existItem = player.inventory.find((item) => item && item.itemCode === itemCode);

    if(existItem){
      const item = itemBox.putAnItem(player,itemCode,count);
      console.log(`플레이어가 아이템을 넣었습니다 ${JSON.stringify(item)}`);
      console.log(`플레이어 인벤토리 ${JSON.stringify(player.inventory)}`);
      console.log(`상자 인벤토리 ${JSON.stringify(itemBox.itemList)}`);
    
      if(!item){
        throw new CustomError(`아이템을 넣는데 실패했습니다`);
      }
      const playerPutAnItemPayload = {
        playerId: player.user.id,
        itemBoxId: itemBoxId,
        itemData: {
          itemCode: itemCode, //{itemCode:count}
          count: count,
        },
        success: true,
      };
  
      const notification = makePacket(config.packetType.S_PLAYER_PUT_AN_ITEM_NOTIFICATION, playerPutAnItemPayload);
  
      room.broadcast(notification);
    }


};

export default playerPutAnItemHandler;
