/* ServerSession 클래스 */
class ServerSession {
  constructor() {
    this.servers = new Map();
  }

  addServer(host, socket) {
    this.servers.set(host, socket);
  }

  deleteServer(host) {
    this.servers.delete(host);
  }
}

export default ServerSession;
