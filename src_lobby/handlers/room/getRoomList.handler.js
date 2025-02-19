import { config } from '../../config/config.js';
import { userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';

const getRoomListHandler = ({ socket, payload, userId }) => {
  const user = userSession.getUser(+userId);
  if (!user) {
    throw new CustomError('유저를 찾지 못했습니다.');
  }

  // 1. 패킷 전송
  const getRoomListResponse = [
    config.packetType.GET_ROOM_LIST_RESPONSE,
    {
      rooms: roomSession.getRoomsData(),
    },
  ];

  user.sendPacket(getRoomListResponse);
};

export default getRoomListHandler;
