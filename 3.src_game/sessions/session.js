import GameSession from '../classes/game/gameSession.class.js';
import UserSession from '../classes/user/userSession.class.js';
import ServerSession from '../classes/server/serverSession.class.js';

export const userSession = new UserSession();
export const serverSession = new ServerSession();
export const gameSession = new GameSession();
