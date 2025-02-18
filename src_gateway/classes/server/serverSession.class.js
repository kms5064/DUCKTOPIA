/* ServerSession 클래스 */
class ServerSession {
  constructor() {
    this.servers = new Map();
  }

  addServer(serverId, socket) {
    this.servers.set(serverId, socket);
  }

  getServerById(serverId) {
    return this.servers.get(serverId);
  }

  deleteServer(serverId) {
    this.servers.delete(serverId);
  }
}

export default ServerSession;
