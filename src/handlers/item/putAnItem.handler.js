import CustomError from '../../utils/error/customError.js';
import { errorHandler } from '../../utils/error/errorHandler.js';
import { config } from '../../config/config.js';
import makePacket from "../../utils/packet/makePacket.js";
import { userSession } from '../../sessions/session.js';
import { roomSession } from '../../sessions/session.js';

const playerPutAnItemHandler = ({ socket, sequence, payload }) => {
    const { itemBoxId,itemCode, count } = payload;
    console.log(`putAnItemHandler itemBoxId: ${itemBoxId},itemType: ${itemType},count: ${count}`);

    // 유저 객체 조회
    const user = userSession.getUser(socket.id);
    if (!user) {
      throw new CustomError( '유저를 찾을 수 없습니다.');
    }

    // RoomId 조회
    const roomId = user.getRoomId();
    if (!roomId) {
      throw new CustomError( '유저에게서 roodId를 찾을 수 없습니다.');
    }

    // 룸 객체 조회
    const room = roomSession.getRoom(roomId);
    if (!room) {
      throw new CustomError('방을 찾을 수 없습니다.');
    }

    // 게임 객체(세션) 조회
    const game = room.getGame();
    if (!game) {
      throw new CustomError( '게임을 찾을 수 없습니다.');
    }

    // 플레이어 객체 조회
    const player = game.getPlayerById(user.id);
    if (!player) {
      throw new CustomError( '플레이어를 찾을 수 없습니다');
    }

    const itemBox = game.getItemBoxById(itemBoxId);
    if (!itemBox) {
      throw new CustomError( '상자를 찾을 수 없습니다');
    }
    //상자에 빈공간이 있는지
    const checkRoom = (ele) => ele ===null;
    const emptyIndex = itemBox.itemList.findIndex(checkRoom);

    if(emptyIndex !== -1){
      const item = itemBox.putAnItem(player,itemCode,count,emptyIndex);
    
      const playerPutAnItemPayload = {
        playerId: player.user.id,
        itemBoxId: itemBoxId,
        itemData: {
          itemType: Object.keys(item)[0], //{code:count}
          count: Object.values(item)[0],
        },
        count: item.itemCode,
        success: true,
      };
  
      const notification = makePacket(config.packetType.S_PLAYER_PUT_AN_ITEM_NOTIFICATION, playerPutAnItemPayload);
  
      room.broadcast(notification);
    }


};

export default playerPutAnItemHandler;
