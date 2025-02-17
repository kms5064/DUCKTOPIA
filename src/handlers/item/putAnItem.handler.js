import CustomError from '../../utils/error/customError.js';
import { errorHandler } from '../../utils/error/errorHandler.js';
import { config } from '../../config/config.js';
import makePacket from "../../utils/packet/makePacket.js";
import { userSession } from '../../sessions/session.js';
import { roomSession } from '../../sessions/session.js';

const playerPutAnItemHandler = ({ socket, sequence, payload }) => {
  try {
    const { itemBoxId,itemType, count } = payload;
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

    // player.removeItem(item.id);
    // const payload = itemBox.putAnItem(index, item);

    // // 넣어진 아이템을 success코드와 같이 브로드캐스트 해야한다.

    // const putAnItemRes = makePacket(config.packetType.PUT_AN_ITEM_RESPONSE, payload);

    const playerPutAnItemPayload ={
      playerId:player.user.id,
      itemBoxId: 2,
      itemData:{
        itemId: itemType,
        count: count,
      },
      count:count,
      success:false
    };

    const notification = makePacket(config.packetType.S_PLAYER_PUT_AN_ITEM_NOTIFICATION, playerPutAnItemPayload);
    //이 유저가 열고 있다는거 브로드캐스트

    room.broadcast(notification);
  } catch (error) {
    console.error(error);
    errorHandler(socket, error, config.packetType.S_PLAYER_PUT_AN_ITEM_NOTIFICATION);
  }
};

export default playerPutAnItemHandler;
