import makePacket from '../../utils/packet/makePacket.js';
import { roomSession, userSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';

const attackPlayerMonsterHandler = ({ socket, payload }) => {
  const { playerDirX, playerDirY, monsterId } = payload;

  // console.log("몬스터 데미지 실행")

  // 유저 객체 조회
  const user = userSession.getUser(socket.id);
  if (!user) {
    throw new CustomError('유저 정보가 없습니다.');
  }

  // RoomId 조회
  const roomId = user.getRoomId();
  if (!roomId) {
    throw new CustomError(`User(${user.id}): RoomId 가 없습니다.`);
  }

  // 룸 객체 조회
  const room = roomSession.getRoom(roomId);
  if (!room) {
    throw new CustomError(`Room ID(${roomId}): Room 정보가 없습니다.`);
  }

  // 게임 객체(세션) 조회
  const game = room.getGame();
  if (!game) {
    throw new CustomError(`Room ID(${roomId}): Game 정보가 없습니다.`);
  }

  // 플레이어 객체 조회
  const player = game.getPlayerById(user.id);
  if (!player) {
    throw new CustomError(`Room ID(${roomId})-User(${user.id}): Player 정보가 없습니다.`);
  }

  // Notification - 다른 플레이어들에게 전달
  const motionPayload = { playerId: user.id, playerDirX, playerDirY };
  let packet = makePacket(config.packetType.S_PLAYER_ATTACK_NOTIFICATION, motionPayload);
  game.notification(socket, packet);

  // 몬스터 조회
  const monster = game.getMonsterById(monsterId);
  if (!monster) {
    throw new CustomError(`Monster ID : ${monsterId}는 존재하지 않습니다.`);
  }

  // 몬스터 HP 차감 처리
  const damage = player.getPlayerAtkDamage();
  const currHp = monster.setDamaged(damage);

  // console.log(monsterId, ' HP: ', currHp);

  // 패킷 생성
  packet = makePacket(config.packetType.S_MONSTER_HP_UPDATE_NOTIFICATION, {
    monsterId,
    hp: currHp,
  });

  // broadcast - 모든 플레이어들에게 전달
  game.broadcast(packet);

  if (currHp <= 0) {
    // 몬스터 사망 처리
    game.removeMonster(monsterId);

    console.log(monsterId, ' 번 몬스터 죽음');

    packet = makePacket(config.packetType.S_MONSTER_DEATH_NOTIFICATION, {
      monsterId,
    });
    game.broadcast(packet);
  }
};

export default attackPlayerMonsterHandler;
