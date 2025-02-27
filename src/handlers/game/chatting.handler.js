import { config } from "../../config/config.js";
import CustomError from "../../utils/error/customError.js";
import makePacket from "../../utils/packet/makePacket.js";




const chattingHandler = ({ socket, payload }) => {
    const { chatting } = payload;

    const user = userSession.getUser(socket.id);
    if (!user) {
        throw new CustomError('유저 정보가 없습니다.');
    }

    // RoomId 조회
    const roomId = user.getRoomId();
    if (!roomId) {
        throw new CustomError(`User(${user.id}): RoomId 가 없습니다.`);
    }

    // 룸 객체 조회
    const room = roomSession.getRoom(roomId);
    if (!room) {
        throw new CustomError(`Room ID(${roomId}): Room 정보가 없습니다.`);
    }

    // 게임 객체(세션) 조회
    const game = room.getGame();
    if (!game) {
        throw new CustomError(`Room ID(${roomId}): Game 정보가 없습니다.`);
    }

    // 플레이어 객체 조회
    const player = game.getPlayerById(user.id);
    if (!player) {
        throw new CustomError(`Room ID(${roomId})-User(${user.id}): Player 정보가 없습니다.`);
    }

    if (chatting.length === 0) {
        throw new CustomError(`아무런 내용이 오지 않았습니다.`);
    }

    const chattingPayload = {
        chatting: chatting
    };

    // const packet = makePacket(config.packetType.S_CHATTING_NOTIFICATION, chattingPayload);
    // game.broadcast(packet);
}

export default chattingHandler;