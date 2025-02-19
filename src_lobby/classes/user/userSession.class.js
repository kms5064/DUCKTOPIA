import User from './user.class.js';

/* UserSession 클래스 */
class UserSession {
  constructor() {
    this.users = new Map();
  }

  /* 세션에 유저 추가시키는 메서드 */
  addUser(userId, userName, socket) {
    const newUser = new User(userId, userName, socket);
    this.users.set(userId, newUser);
    return newUser;
  }

  /* 나간 유저 세션에서 제거하는 메서드 */
  deleteUser(userId) {
    this.users.delete(userId);
  }

  /* 특정 유저 조회하는 메서드 */
  getUser(userId) {
    return this.users.get(userId);
  }

  getUsers() {
    return this.users;
  }

  getUserIds() {
    const ids = [];
    this.users.forEach((user) => ids.push(user.id));

    return ids;
  }
}

export default UserSession;
