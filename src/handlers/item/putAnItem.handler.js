import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { errorHandler } from '../../utils/error/errorHandler.js';
import { config } from '../../config/config.js';
import makePacket from "../../utils/packet/makePacket";


const putAnItemHandler = ({ socket, sequence, payload }) => {
  try {
    const { itemBoxId,item, index } = payload;

    // 유저 객체 조회
    const user = userSession.getUser(socket);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    // RoomId 조회
    const roomId = user.getRoomId();
    if (!roomId) {
      throw new CustomError(ErrorCodes.ROOMID_NOT_FOUND, '유저에게서 roodId를 찾을 수 없습니다.');
    }

    // 룸 객체 조회
    const room = roomSession.getRoom(roomId);
    if (!room) {
      throw new CustomError(ErrorCodes.ROOM_NOT_FOUND, '방을 찾을 수 없습니다.');
    }

    // 게임 객체(세션) 조회
    const game = room.getGame();
    if (!game) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '게임을 찾을 수 없습니다.');
    }

    // 플레이어 객체 조회
    const player = game.getPlayerById(user.id);
    if (!player) {
      throw new CustomError(ErrorCodes.PLAYER_NOT_FOUND, '플레이어를 찾을 수 없습니다');
    }

    const itemBox = game.getItemBoxById(itemBoxId);

    player.removeItem(item.id);
    const payload = itemBox.putAnItem(index, item);

    // 패킷을 쏴줄 필요가 있나?
    const putAnItemRes = makePacket(config.packetType.TAKE_OUT_AN_ITEM_RESPONSE, payload);

    socket.write(putAnItemRes);
  } catch (error) {
    console.error(error);
    errorHandler(socket, error, config.packetType.TAKE_OUT_AN_ITEM_RESPONSE);
  }
};

export default putAnItemHandler;
