import onGameConnection from '../events/game/onGameConnection.js';
import onLobbyConnection from '../events/lobby/onLobbyConnection.js';
import { initOnRedis, redisClient } from '../db/redis/redis.js';
import { loadProtos } from './loadProtos.js';
import { serverSession } from '../sessions/session.js';
import net from 'net';

const connectToLobbyServer = (host, name) => {
  const lobbyServer = net.createConnection({ host: host, port: 5556 }, () => {
    console.log(`${name}와 연결되었습니다.`);
    onLobbyConnection(lobbyServer);
  });

  //Server:Lobby:1
  serverSession.addServer(name, lobbyServer);
};

const connectToGameServer = (host, name) => {
  const gameServer = net.createConnection({ host: host, port: 5557 }, () => {
    console.log(`${name}와 연결되었습니다.`);
    onGameConnection(gameServer);
  });

  serverSession.addServer(name, gameServer);
};

const InitServer = async () => {
  try {
    await loadProtos();
    await initOnRedis();
    // Redis에 저장된 서버에 연결

    const LobbyServers = await redisClient.lRange('Server:Lobby', 0, -1);
    for (let i = 0; i < LobbyServers.length; i++) {
      const [address, status] = await redisClient.hVals('Server:Lobby:' + i);
      if (+status !== 1) continue;
      connectToLobbyServer(address, 'Server:Lobby:' + i); //로비서버 TCP연결
    }

    const GameServers = await redisClient.lRange('Server:Game', 0, -1);
    for (let i = 0; i < LobbyServers.length; i++) {
      const [address, status] = await redisClient.hVals('Server:Game:' + i);
      if (+status !== 1) continue;
      connectToGameServer(address, 'Server:Game:' + i); //게임서버 TCP연결
    }
  } catch (err) {
    console.error(err);
  }
};

export default InitServer;
