import { userSession } from '../sessions/session.js';
import onData from './onData.js';
import onEnd from './onEnd.js';
import onError from './onError.js';
//import { onData } from './onData.js';

const onConnection = async (socket) => {
  console.log('게이트웨이서버와 연결되었습니다:', socket.remoteAddress, socket.remotePort);

  socket.buffer = Buffer.alloc(0);

  socket.on('data', onData(socket));
  socket.on('end', onEnd(socket));
  socket.on('error', onError(socket));
  // id정보 없는 유저 생성
  userSession.addUser(socket);
};

export default onConnection;
