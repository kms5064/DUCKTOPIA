import { userSession } from '../../../sessions/session.js';

const updateInGame = (userIds) => {
  const users = userIds.split(',');

  for (const userId of users) {
    const user = userSession.getUserByID(+userId);
    if (!user) continue;
    user.setGameState(false);
  }
};

export default updateInGame;
