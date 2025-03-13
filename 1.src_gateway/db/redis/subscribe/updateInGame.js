import { config } from '../../../config/config.js';
import { userSession } from '../../../sessions/session.js';
import { redisClient } from '../redis.js';

const updateInGame = async (userIds) => {
  const users = userIds.split(',');

  for (const userId of users) {
    const user = userSession.getUserByID(+userId);
    if (!user) continue;
    user.setGameState(false);
    // Redis 정보 동기화
    await redisClient.hDel(config.redis.custom + 'Server:User:' + user.id, 'game')
  }
};

export default updateInGame;
