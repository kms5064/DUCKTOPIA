import { config } from '../../config/config.js';
import { redisClient } from '../../db/redis/redis.js';
import { serverSession } from '../../sessions/session.js';
import User from './user.class.js';
import onEnd from '../../events/onEnd.js';
import makeServerPacket from '../../utils/packet/makeServerPacket.js';

/* UserSession 클래스 */
class UserSession {
  constructor() {
    this.ids = new Map();
    this.users = new Map();
    this.id = 1; // 소켓에 socket.id값으로 1을 부여, addUser실행될 때마다 1 증가
    this.name = null;
    this.host = null;
  }

  async addId(id, socket) {
    this.ids.set(id, this.getUser(socket.id));
    const hashData = { gate: this.host };
    await redisClient.hSet(config.redis.custom + 'Server:User:' + id, hashData);
  }

  async checkId(id) {
    // 중복 로그인 확인
    const req = await redisClient.del(config.redis.custom + 'Server:User:' + id);

    // 삭제 성공 시
    if (req === 1) {
      const user = this.getUserByID(id);
      if (user) onEnd(user.socket)();
      await redisClient.publish(config.redis.custom + 'UserOut', String(id));
    }
    return true;
  }

  /* 세션에 유저 추가시키는 메서드 */
  addUser(socket) {
    const newUser = new User(socket);
    socket.id = this.id;
    this.users.set(socket.id, newUser);
    // console.log(`신규 유저 접속 : ${socket.remoteAddress}:${socket.remotePort}`);
    this.id += 1;
    return newUser;
  }

  /* 나간 유저 세션에서 제거하는 메서드 */
  async deleteUser(socketId) {
    const user = this.users.get(socketId);
    const packet = makeServerPacket(config.packetType.LOGOUT_CAST, {}, null, user.id);

    // 로그인 성공 시 Lobby에 유저가 있으므로 삭제요청
    if (user.id) {
      const lobby = config.redis.custom + config.server.lobbyServer;
      const lobbyServer = serverSession.getServerById(lobby);
      lobbyServer.socket.write(packet);
    }

    if (user.gameServer) {
      const gameServer = serverSession.getServerById(user.gameServer);
      if (gameServer) gameServer.socket.write(packet);
    }

    // 레디스 기록 삭제
    await redisClient.del(config.redis.custom + 'Server:User:' + user.id);

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
