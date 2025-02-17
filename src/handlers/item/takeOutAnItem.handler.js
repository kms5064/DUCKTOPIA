import CustomError from '../../utils/error/customError.js';
import { errorHandler } from '../../utils/error/errorHandler.js';
import { config } from '../../config/config.js';
import makePacket from "../../utils/packet/makePacket.js";
import { userSession } from '../../sessions/session.js';
import { roomSession } from '../../sessions/session.js';


const playerTakeOutAnItemHandler = ({ socket, sequence, payload }) => {
    
    //const { itemBoxId, index , count} = payload;
    const { itemBoxId, itemType , count} = payload; //index대신 아이템 종류
    console.log(`takeOutAnItemHandler itemBoxId: ${itemBoxId},itemType: ${itemType},count: ${count}`);



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
      throw new CustomError( '방을 찾을 수 없습니다.');
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

    // const item = itemBox.takeOutAnItem(itemType,count, player);

    // 꺼내진 아이템을 success코드와 같이 브로드캐스트 해야한다.
    const playerTakeOutAnItemPayload = {
      playerId:player.id,
      itemBoxId:itemBox.id,
      itemData:{
        itemId:1,
        count: count,
      },
      count:count,
      success:false
    };

    const notification = makePacket(config.packetType.S_PLAYER_TAKE_OUT_AN_ITEM_NOTIFICATION, playerTakeOutAnItemPayload);
    //이 유저가 열고 있다는거 브로드캐스트

    room.broadcast(notification);
};

export default playerTakeOutAnItemHandler;
