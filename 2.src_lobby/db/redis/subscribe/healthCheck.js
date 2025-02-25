import { redisClient } from '../redis.js';

const healthCheck = (message, channel) => {
  // console.log(channel, message);
  redisClient.hSet(channel, 'check', 'update');
};

export default healthCheck;
