import { config } from '../../config/config.js';
import { redisClient } from '../../db/redis/redis.js';
import onGameEnd from '../../events/game/onGameEnd.js';
import onLobbyEnd from '../../events/lobby/onLobbyEnd.js';
import { userSession } from '../../sessions/session.js';
import makeServerPacket from '../../utils/packet/makeServerPacket.js';


class Server {
  constructor(serverId, socket) {
    this.socket = socket;
    this.socket.id = serverId; //여기에 유니크 아이디
    this.type = serverId.split(':')[1];
    this.intervals = [];
    this.stack = 0;
    // 헬스체킹
    this.intervals.push(setInterval(this.healthCheck, 5000));
    // 레이턴시 확인
    // this.intervals.push(setInterval(this.latencyCheck, 5000));
  }

  healthCheck = async () => {
    // stack 증감
    const test = await redisClient.hGet(userSession.name, this.socket.id);
    if (test === 'testing') this.stack++
    else this.stack = 0;

    // stack 검증
    if (this.stack >= 5) {
      switch (this.type) {
        case 'Game':
          onGameEnd(this.socket)();
          break;
        case 'Lobby':
          onLobbyEnd(this.socket)();
          break;
      }
      await redisClient.hSet(this.socket.id, 'status', 0);
    }

    // 테스팅 시작
    await redisClient.hSet(userSession.name, this.socket.id, 'testing');
    await redisClient.publish(this.socket.id, userSession.name);

    //console.log(`//HealthCheck// [Server] ${this.socket.id} / [Stack] : ${this.stack} `);
  };

  // 레이턴시 확인
  latencyCheck = () => {
    const packet = makeServerPacket(
      config.packetType.S_ERROR_NOTIFICATION,
      {
        errorMessage: 'latencyCheck',
        timestamp: Date.now(),
      },
      -1,
    );
    this.socket.write(packet);
  };

  clearChecker() {
    this.intervals.forEach((interval) => clearInterval(interval));
  }
}

export default Server;
