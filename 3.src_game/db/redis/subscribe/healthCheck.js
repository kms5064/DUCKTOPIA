import { redisClient } from '../redis.js';

// 방 생성 핸들러
const healthCheck = (message, channel) => {
  redisClient.hSet(message, channel, 'update');
};

export default healthCheck;
