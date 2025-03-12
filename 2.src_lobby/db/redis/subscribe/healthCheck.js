import { redisClient } from '../redis.js';

const healthCheck = (message, channel) => {
  // console.log(channel, message);
  redisClient.hSet(message, channel, 'update');
};

export default healthCheck;
