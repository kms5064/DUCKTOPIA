import { userSession } from '../../sessions/session.js';
import onLobbyData from './onLobbyData.js';
import onLobbyEnd from './onLobbyEnd.js';
import onLobbyError from './onLobbyError.js';
//import { onData } from './onData.js';

const onLobbyConnection = async (socket) => {
  socket.buffer = Buffer.alloc(0);

  socket.on('data', onLobbyData(socket));
  socket.on('end', onLobbyEnd(socket));
  socket.on('error', onLobbyError(socket));
};

export default onLobbyConnection;
