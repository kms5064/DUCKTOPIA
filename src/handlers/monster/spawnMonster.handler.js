import { userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import { PACKET_TYPE } from '../../config/constants/header.js';

const spawnMonsterHandler = ({ socket, payload }) => {
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

  payload.forEach((monster) => {
    // 몬스터 위치 적용
    game.getMonsterById(monster.id).setPosition(monster.x, monster.y);
  });

  const packet = makePacket(PACKET_TYPE.S_MONSTER_SPAWN_NOTIFICATION, payload);
  game.notification(socket, packet);
};

export default spawnMonsterHandler;
