import makePacket from '../../utils/packet/makePacket.js';
import { roomSession, userSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';

const weaponPlayerHandler = ({ socket, payload }) => {
  const { itemId } = payload;
  console.log(payload);
  // 유저 객체 조회
  const user = userSession.getUser(socket.id);
  if (!user) {
    throw new Error('유저 정보가 없습니다.');
  }

  // RoomId 조회
  const roomId = user.getRoomId();
  if (!roomId) {
    throw new Error(`User(${user.id}): RoomId 가 없습니다.`);
  }

  // 룸 객체 조회
  const room = roomSession.getRoom(roomId);
  if (!room) {
    throw new Error(`Room ID(${roomId}): Room 정보가 없습니다.`);
  }

  // 게임 객체(세션) 조회
  const game = room.getGame();
  if (!game) {
    throw new Error(`Room ID(${roomId}): Game 정보가 없습니다.`);
  }

  game.getPlayerById();
  // TODO : NOTI용 패킷 추가 해야함.
  const packet = makePacket(config.packetType.S_PLAYER_EQUIP_WEAPON_RESPONSE, {
    success: true,
    itemId,
    playerId: user.getUserData().id,
  });
  console.log(packet);
  game.broadcast(packet);
};

export default weaponPlayerHandler;
