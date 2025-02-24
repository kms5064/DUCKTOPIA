import redis from 'redis';
import { config } from '../../config/config.js';

// Redis 클라우드 인스턴스에 연결
const redisClient = redis.createClient({
  url:
    'redis://' +
    config.redis.user +
    ':' +
    config.redis.password +
    '@' +
    config.redis.host +
    ':' +
    config.redis.port,
});

// 연결 성공 시
redisClient.on('connect', () => {
  console.log('Redis 연결 성공!!');
});

// 연결 실패 시 에러 출력
redisClient.on('error', (err) => {
  console.error('Redis 연결 오류:', err);
});

await redisClient.connect();

export const setRedisToRoom = async (roomInfo) => {
  const key = 'Room:' + roomInfo.roomId;
  const serializedObj = JSON.stringify(roomInfo);

  await redisClient.set(key, serializedObj);
  await redisClient.disconnect();
  return key;
};

export const getRedisRoomInfo = async (key) => {
  const data = await redisClient.get(key);
  await redisClient.disconnect();

  const parseData = JSON.parse(data);
  return parseData;
};