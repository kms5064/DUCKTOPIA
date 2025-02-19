import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import CustomError from '../../utils/error/customError.js';
import { setRedisToRoom } from '../../db/redis/redis.js';

const gamePrepareReqHandler = ({ socket, payload, userId }) => {
  const user = userSession.getUser(userId);
  if (!user) {
    throw new CustomError('유저가 존재하지 않습니다!');
  }
  const room = roomSession.getRoom(user.roomId);
  if (!room || room.ownerId !== userId) {
    throw new CustomError('올바른 요청이 아닙니다!');
  }

  const GamePrepareResponse = [
    config.packetType.PREPARE_GAME_RESPONSE,
    {
      success: true,
      room: room.getRoomData(),
    },
  ];

  user.sendPacket(GamePrepareResponse);
};

export default gamePrepareReqHandler;
