import Server from './server.class.js';

/* ServerSession 클래스 */
class ServerSession {
  constructor() {
    this.servers = new Map();
  }

  addServer(host, socket) {
    servers.set(host, server);
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

  getLobbyServers() {
    return this.lobbyServers;
  }
}

export default ServerSession;
