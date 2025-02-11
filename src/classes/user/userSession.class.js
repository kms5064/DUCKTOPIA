import User from './user.class.js';

/* UserSession 클래스 */
class UserSession {
  constructor() {
    // key = email, value = socket
    this.logins = new Map();
    this.users = new Map();
  }

  // 로그인 시 이메일 추가
  addId(email, socket) {
    // if (this.logins.has(email)) {
    //   // 중복 로그인이면 기존 로그인된 소켓 연결 종료
    //   onEnd(this.logins.get(email))();
    //   this.logins.delete(email);
    // }

    this.logins.set(email, socket);
  }

  checkId(email) {
    return this.logins.has(email);
  }

  /* 세션에 유저 추가시키는 메서드 */
  addUser(socket) {
    const newUser = new User(socket);
    this.users.set(socket, newUser);
    console.log(`신규 유저 접속 : ${socket.remoteAddress}:${socket.remotePort}`);
    return newUser;
  }

  /* 나간 유저 세션에서 제거하는 메서드 */
  deleteUser(socket) {
    const user = this.users.get(socket);
    this.users.delete(socket)
    this.logins.delete(user.email);
  }

  /* 특정 유저 조회하는 메서드 */
  getUser(socket) {
    return this.users.get(socket);
  }
}

export default UserSession;
