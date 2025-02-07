import { PACKET_TYPE } from '../../config/constants/header.js';
import { roomSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';

const getRoomListHandler = ({socket, payload}) => {
  // 1.현재 rooms에서 roomDatas로 가공
  const rooms = roomSession.getRooms();

  // let roomDatas = [];

  // for (const room of rooms) {
  //   const roomUsers = room.getUsers();

  //   // 유저 이름 추출
  //   let users = [];
  //   for (const user of roomUsers) {
  //     users.push(user.name);
  //   }

  //   // roomId, state, users 추출
  //   roomDatas.push({
  //     roomId: room.id,
  //     state: room.state,
  //     users,
  //   });
  // }

  // 2. 패킷 전송
  const getRoomListResponse = makePacket(PACKET_TYPE.GET_ROOM_LIST_RESPONSE, {
    success: true,
    rooms: roomSession.getRoomsData(),
    message: '방 리스트를 조회했습니다!',
  });

  socket.write(getRoomListResponse);
};

export default getRoomListHandler;
