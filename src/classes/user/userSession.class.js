import User from './user.class.js';

/* UserSession 클래스 */
class UserSession {
  users = new Map();

  /* 세션에 유저 추가시키는 메서드 */
  addUser(socket) {
    const newUser = new User(socket);
    this.users.set(socket, newUser);
    console.log(`신규 유저 접속 : ${socket.remoteAddress}:${socket.remotePort}`);
    return newUser;
  }

  /* 나간 유저 세션에서 제거하는 메서드 */
  User(socket) {
    this.users.delete(socket);
  }

  /* 특정 유저 조회하는 메서드 */
  getUser(socket) {
    return this.users.get(socket);
  }

}

export default UserSession;
