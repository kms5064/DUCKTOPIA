import { config } from '../../../src_game/config/config';
import CustomError from '../../../src_game/utils/error/customError';
import { getRedisRoomInfo } from '../../db/redis/redis';
import makePacket from '../../utils/packet/makePacket';

export const serverJoinHandler = async ({ socket, payload }) => {
  const { playerId, redisKey, token } = payload;

  let isSuccess = true; // 정상여부

  // 1. 패킷 전체 체크
  if (!playerId || !redisKey || !token) {
    throw new CustomError('패킷 없어!');
  }

  // 2. 레디스에 데이터 조회(roomId)
  const data = await getRedisRoomInfo(redisKey);
  if (!data) {
    isSuccess = false;
  }

  const tokens = Object.values(data.tokens);
  if (!tokens[playerId]) {
    // PlayerId 변조
    throw new CustomError('토큰 정보가 없습니다.');
  } else {
    if (tokens[playerId] !== token) {
      // TOKEN 값 변조
      throw new CustomError('유효하지 않는 토큰 입니다.');
    }
  }
  const createRoomResponse = makePacket(config.packetType.JOIN_SERVER_RESPONSE, {
    success: isSuccess,
  });

  socket.write(createRoomResponse);
};
