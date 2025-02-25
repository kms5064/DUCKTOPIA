import makeServerPacket from '../../utils/packet/makeServerPacket.js';
import { serverSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';
import { config } from '../../config/config.js';
import { redisClient } from '../../db/redis/redis.js';

const gameStartHandler = async ({ socket, payload, userId }) => {
  // 방장의 상태 확인
  const user = userSession.getUserByID(userId);
  if (!user || !user.id) throw new CustomError('유저 정보가 없습니다.');
  if (user.getGameState()) throw new CustomError(`올바르지 못한 요청입니다. (USER ID: ${user.id})`);

  if (payload.success) {
    // 로드 밸런싱 후 게임 서버 이름 저장

    const gameServers = serverSession.getGameServers();
    console.log('size : ', gameServers.size);
    let minGameCount = Infinity;
    let gameServerId = null;
    let minGameServer;

    // game 수가 최소인 게임 서버 ID 확인
    for (const [id, gameServer] of gameServers) {
      const count = await redisClient.hGet(id, 'games');
      if (count < minGameCount) {
        minGameCount = count;
        gameServerId = id;
        minGameServer = gameServer;
      }
    }

    // 게임 상태 동기화
    for (const { name, userId: tempId } of payload.room.users) {
      const tempUser = userSession.getUserByID(tempId);
      tempUser.setGameState(payload.success);
      tempUser.gameServer = gameServerId;
    }

    const serverPayload = { room: payload.room };
    const reqPacket = makeServerPacket(
      config.packetType.JOIN_SERVER_REQUEST,
      serverPayload,
      user.id,
    );

    console.log(`${gameServerId} 서버로 ${payload.room.users.length}수의 유저가 분배되었습니다!`);
    minGameServer.socket.write(reqPacket);
  } else throw CustomError('게임 시작 요청이 실패했습니다.');
};

export default gameStartHandler;
