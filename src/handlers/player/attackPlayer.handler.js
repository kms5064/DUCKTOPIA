import { PACKET_TYPE } from '../../config/constants/header.js';
import makePacket from '../../utils/packet/makePacket.js';
import { roomSession, userSession } from '../../sessions/session.js';

const attackPlayerHandler = ({ socket, payload }) => {
  const { playerDirX, playerDirY } = payload;

  // 유저 객체 조회
  const user = userSession.getUser(socket);
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

  // 플레이어 객체 조회
  const player = game.getPlayerById(user.id);
  if (!player) {
    throw new Error(`Room ID(${roomId})-User(${user.id}): Player 정보가 없습니다.`);
  }

  // Notification - 다른 플레이어들에게 전달
  const motionPayload = { playerId: player.id, playerDirX, playerDirY };
  const packet = makePacket(PACKET_TYPE.S_PLAYER_ATTACK_NOTIFICATION, motionPayload);
  game.notification(socket, packet);
};

export default attackPlayerHandler;
