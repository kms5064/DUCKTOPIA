import CustomError from '../../utils/error/customError.js';
import { errorHandler } from '../../utils/error/errorHandler.js';
import { config } from '../../config/config.js';
import makePacket from '../../utils/packet/makePacket.js';
import { userSession } from '../../sessions/session.js';
import { roomSession } from '../../sessions/session.js';

const playerOpenBoxHandler = ({ socket, sequence, payload }) => {
  try {
    const { itemBoxId } = payload;
    console.log(`openBoxHandler itemBoxId: ${itemBoxId}`);

    // 유저 객체 조회
    console.log(`playerOpenBoxHandler 에 socket ${socket}`)
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
    game.addBox();//테스트용

    const itemBox = game.getItemBoxById(itemBoxId);
    if (!itemBox) {
      throw new CustomError( '상자를 찾을 수 없습니다');
    }

    //유효한 거리인지 검증
    //이 박스가 점유중이라면 컷
    //박스 오픈한채로 돌아다니면 박스 닫히게?
   //  if (
   //    itemBox.calculateDistance <= config.game.VALID_DISTANCE_OF_BOX &&
   //    itemBox.occupied !== null
   //  ) {
   //    itemBox.occupied = player.id;

   //    const itemList = itemBox.getItemList();
   //    const payload = {
   //      playerId: player.id,
   //      itemBoxId: itemBoxId,
   //      itemData: itemList,
   //    };

   //    const notification = makePacket(config.packetType.S_PLAYER_OPEN_BOX_RESPONSE, payload);
   //    //이 유저가 열고 있다는거 브로드캐스트

   //    room.broadcast(notification);
   //  }
    //테스트용 패킷
    const playerOpenBoxPayload = {
      playerId: player.id,
      itemBoxId: itemBoxId,
      itemData: itemBox.itemList,
    };

    const notification = makePacket(config.packetType.S_PLAYER_OPEN_BOX_NOTIFICATION, playerOpenBoxPayload);
    //이 유저가 열고 있다는거 브로드캐스트

    room.broadcast(notification);

  } catch (error) {
    console.error(error);
    errorHandler(socket, error, config.packetType.S_PLAYER_OPEN_BOX_NOTIFICATION);
  }
};

export default playerOpenBoxHandler;
