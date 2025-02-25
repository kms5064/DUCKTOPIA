import { redisClient } from '../redis.js';

// 방 생성 핸들러
const healthCheck = (message, channel) => {
  redisClient.hSet(channel, 'check', 'update');
};

export default healthCheck;
