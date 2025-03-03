import { serverSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import makeServerPacket from '../../utils/packet/makeServerPacket.js';
import User from './user.class.js';

/* UserSession 클래스 */
class UserSession {
  constructor() {
    // key = email, value = socket
    this.logins = new Map();
    this.ids = new Map();
    this.users = new Map();
    this.id = 1; // 소켓에 socket.id값으로 1을 부여, addUser실행될 때마다 1 증가
  }

  // 로그인 시 이메일 추가
  addId(email, id, socket) {
    this.ids.set(id, this.getUser(socket.id));
    this.logins.set(email, socket);
  }

  checkId(email) {
    return this.logins.has(email);
  }

  /* 세션에 유저 추가시키는 메서드 */
  addUser(socket) {
    const newUser = new User(socket);
    socket.id = this.id;
    this.users.set(socket.id, newUser);
    console.log(`신규 유저 접속 : ${socket.remoteAddress}:${socket.remotePort}`);
    this.id += 1;
    return newUser;
  }

  /* 나간 유저 세션에서 제거하는 메서드 */
  deleteUser(socketId) {
    const user = this.users.get(socketId);
    const packet = makeServerPacket(config.packetType.LOGOUT_CAST, {}, user.id);

    // 로그인 성공 시 Lobby에 유저가 있으므로 삭제요청
    if (user.id) {
      const lobby = config.redis.custom + config.server.lobbyServer;
      const lobbyServer = serverSession.getServerById(lobby);
      lobbyServer.socket.write(packet);
    }

    let gameServer = null;
    if (user.gameServer) {
      gameServer = serverSession.getServerById(user.gameServer);
      if (gameServer) gameServer.socket.write(packet);
    }

    this.logins.delete(user.email);
    this.users.delete(socketId);
  }

  /* 특정 유저 조회하는 메서드 */
  getUser(socketId) {
    return this.users.get(socketId);
  }

  getUserByID(userId) {
    return this.ids.get(userId);
  }
}

export default UserSession;
