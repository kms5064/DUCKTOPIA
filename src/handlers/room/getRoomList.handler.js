import { roomSession } from '../../sessions/session.js';

const getRoomListHandler = (socket, payload) => {
  // 1. 패킷 전송
  const getRoomListResponse = makePacket(PACKET_TYPE.GET_ROOM_LIST_RESPONSE, {
    rooms: roomSession.getRoomDatas(),
  });

  socket.write(getRoomListResponse);
};

export default getRoomListHandler;
