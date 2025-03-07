import { userSession } from '../sessions/session.js';
import onData from './onData.js';
import onEnd from './onEnd.js';
import onError from './onError.js';
import { serverSession } from '../sessions/session.js';
//import { onData } from './onData.js';

const onConnection = async (socket) => {
  console.log('[게이트웨이] 서버와 연결되었습니다:', socket.remoteAddress, socket.remotePort);

  socket.buffer = Buffer.alloc(0);
  serverSession.addServer(socket.remoteAddress, socket);

  socket.on('data', onData(socket));
  socket.on('end', onEnd(socket));
  socket.on('error', onError(socket));
};

export default onConnection;
