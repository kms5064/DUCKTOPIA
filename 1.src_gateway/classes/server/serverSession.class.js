import Server from './server.class.js';

/* ServerSession 클래스 */
class ServerSession {
  constructor() {
    this.gameServers = new Map();
    this.lobbyServers = new Map();
    this.types = { Game: this.gameServers, Lobby: this.lobbyServers };
    this.host = null;
  }

  addServer(serverId, socket) {
    const server = new Server(serverId, socket);
    const type = serverId.split(':')[1];
    const servers = this.types[type];

    servers.set(serverId, server);
  }

  getServerById(serverId) {
    const type = serverId.split(':')[1];
    const servers = this.types[type];

    return servers.get(serverId);
  }

  deleteServer(serverId) {
    const type = serverId.split(':')[1];
    const servers = this.types[type];
    const server = servers.get(serverId);
    server.clearChecker();
    servers.delete(serverId);
  }

  getGameServers() {
    return this.gameServers;
  }
}

export default ServerSession;
