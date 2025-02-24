import redisClient from './src_lobby/db/redis/redis.js';

// 객체 생성
const user = {
  name: 'Alice',
  age: 30,
  city: 'Seoul',
};

const serializedUser = JSON.stringify(user);

await redisClient.set('Room:roomId', serializedUser);

const a = await redisClient.get('test:2');
const json = JSON.parse(a);
console.log(json.name);
console.log(json.age);

redisClient.disconnect().then();
