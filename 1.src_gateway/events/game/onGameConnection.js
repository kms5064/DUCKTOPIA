import { userSession } from '../../sessions/session.js';
import onGameData from './onGameData.js';
import onGameEnd from './onGameEnd.js';
import onGameError from './onGameError.js';
//import { onData } from './onData.js';

const onGameConnection = async (socket) => {
  socket.buffer = Buffer.alloc(0);

  socket.on('data', onGameData(socket));
  socket.on('end', onGameEnd(socket));
  socket.on('error', onGameError(socket));
};

export default onGameConnection;
