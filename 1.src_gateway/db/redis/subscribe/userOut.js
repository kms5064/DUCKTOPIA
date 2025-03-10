import { userSession } from '../../../sessions/session.js';
import onEnd from '../../../events/onEnd.js';

const userOut = (userId) => {
  const user = userSession.getUserByID(+userId);
  if (!user || Date.now() - user.loginTime <= 1000) return;

  onEnd(user.socket)();
};

export default userOut;
