import Server from './server.class.js';

/* ServerSession 클래스 */
class ServerSession {
  constructor() {
    this.servers = new Map();
  }

  addServer(host, socket) {
    servers.set(host, socket);
  }

  deleteServer(host) {
    servers.delete(serverId);
  }
}

export default ServerSession;
