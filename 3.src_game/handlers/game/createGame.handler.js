import { gameSession, userSession, serverSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';
import { redisClient } from '../../db/redis/redis.js';

// 방 생성 핸들러
const createGameHandler = async ({ socket, payload, userId }) => {
  const { room } = payload;
  if (!room) throw new CustomError('유효하지않는 요청입니다.');
  const { roomId, ownerId, users } = room;

  // 게임 만들기
  const game = await gameSession.addGame(roomId, ownerId);

  // 서버, 게임 에 유저 추가하기
  for (const user of users) {
    // **만약 게이트 웨이가 증설되면 socket이 유저마다 달라질 수 있음을 주의..**
    const host = await redisClient.hGet(config.redis.custom + 'Server:User:' + user.userId, 'gate');
    const gateSocket = serverSession.servers.get(host);
    if (!gateSocket) continue;

    const serverUser = userSession.addUser(user.userId, user.name, roomId, gateSocket);
    game.addUser(serverUser);
  }

  const user = userSession.getUser(userId);

  // 초기 몬스터 정보 생성
  const monsterData = game.createMonsterData();
  if (!monsterData) throw new CustomError('몬스터 데이터 생성에 실패했습니다.');

  //초기 오브젝트 정보 생성
  const objectData = game.createObjectData();
  if (!objectData) throw new CustomError('오브젝트 데이터 생성에 실패했습니다.');

  const GamePrepareResponse = [
    config.packetType.PREPARE_GAME_RESPONSE,
    {
      success: true,
      monsters: monsterData,
      objectsPositionData: objectData,
    },
  ];

  user.sendPacket(GamePrepareResponse);

  const GamePrepareNotification = [
    config.packetType.PREPARE_GAME_NOTIFICATION,
    {
      room,
    },
  ];
  game.broadcast(GamePrepareNotification);
  // user.sendPacket(GamePrepareResponse);
};

export default createGameHandler;
