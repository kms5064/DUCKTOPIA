import { userSession } from '../../sessions/session.js';
import onData from './onLobbyData.js';
import onEnd from './onLobbyEnd.js';
import onError from './onLobbyError.js';
//import { onData } from './onData.js';

const onLobbyConnection = async (socket) => {
  socket.buffer = Buffer.alloc(0);

  socket.on('data', onData(socket));
  socket.on('end', onEnd(socket));
  socket.on('error', onError(socket));
  // // id정보 없는 유저 생성
  // userSession.addUser(socket);
};

export default onLobbyConnection;
