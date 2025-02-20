import { userSession } from '../../sessions/session.js';
import onData from './onGameData.js';
import onEnd from './onGameEnd.js';
import onError from './onGameError.js';
//import { onData } from './onData.js';

const onGameConnection = async (socket) => {
  socket.buffer = Buffer.alloc(0);

  socket.on('data', onData(socket));
  socket.on('end', onEnd(socket));
  socket.on('error', onError(socket));
  // // id정보 없는 유저 생성
  // userSession.addUser(socket);
};

export default onGameConnection;
