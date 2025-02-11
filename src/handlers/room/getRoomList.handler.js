import { roomSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import { PACKET_TYPE } from '../../config/constants/header.js';

const getRoomListHandler = ({ socket, payload }) => {
  // 1. 패킷 전송
  const getRoomListResponse = makePacket(PACKET_TYPE.GET_ROOM_LIST_RESPONSE, {
    rooms: roomSession.getRoomsData(),
  });

  socket.write(getRoomListResponse);
};

export default getRoomListHandler;
