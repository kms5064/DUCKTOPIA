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

const subscriber = redisClient.duplicate();

// 연결 성공 시
redisClient.on('connect', () => {
  console.log('Redis 연결 성공!!');
});

// 연결 실패 시 에러 출력
redisClient.on('error', (err) => {
  console.error('Redis 연결 오류:', err);
});

await redisClient.connect();

subscriber.on('connect', () => {
  console.log('Redis 구독자 연결성공!!');
});

// 연결 실패 시 에러 출력
subscriber.on('error', (err) => {
  console.error('Redis 구독자 오류:', err);
});

await subscriber.connect();

export { redisClient, subscriber };
