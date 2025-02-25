import { redisClient } from '../../db/redis/redis.js';
import onGameEnd from '../../events/game/onGameEnd.js';
import onLobbyEnd from '../../events/lobby/onLobbyEnd.js';

class Server {
  constructor(serverId, socket) {
    this.socket = socket;
    this.socket.id = serverId; //여기에 유니크 아이디
    this.type = serverId.split(':')[1];
    this.stack = 0;
    // 헬스체킹
    this.interval = setInterval(this.healthCheck, 5000);
  }

  healthCheck = async () => {
    // stack 증감
    const test = await redisClient.hGet(this.socket.id, 'check', 'testing');
    if (test === 'testing') this.stack++;
    else this.stack = 0;

    // stack 검증
    if (this.stack >= 2) {
      switch (this.type) {
        case 'Game':
          onGameEnd(this.socket)();
          break;
        case 'Lobby':
          onLobbyEnd(this.socket)();
          break;
      }
    }

    // 테스팅 시작
    redisClient.hSet(this.socket.id, 'check', 'testing');
    redisClient.publish(this.socket.id, 'testing');

    // console.log(`//HealthCheck// [Server] ${this.socket.id} / [Stack] : ${this.stack} `);
  };

  clearChecker() {
    clearInterval(this.interval);
  }
}

export default Server;
