import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

const gamePrepareReqHandler = ({ socket, payload, userId }) => {
  const user = userSession.getUser(userId);
  if (!user) {
    throw new CustomError('유저가 존재하지 않습니다!');
  }
  const room = roomSession.getRoom(user.roomId);
  if (!room || room.ownerId !== userId) {
    throw new CustomError('올바른 요청이 아닙니다!');
  }

  room.changeState(1);

  const GamePrepareResponse = [
    config.packetType.PREPARE_GAME_SERVER,
    {
      success: true,
      room: room.getRoomData(),
    },
  ];

  user.sendPacket(GamePrepareResponse);
};

export default gamePrepareReqHandler;
