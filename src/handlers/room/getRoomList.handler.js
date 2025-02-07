import { roomSession } from '../../sessions/session.js';

const getRoomListHandler = (socket, payload) => {
  // 1. 패킷 전송
  const getRoomListResponse = makePacket(PACKET_TYPE.GET_ROOM_LIST_RESPONSE, {
    success: true,
    rooms: roomSession.getRoomDatas(),
    message: '방 리스트를 조회했습니다!',
  });

  socket.write(getRoomListResponse);
};

export default getRoomListHandler;
