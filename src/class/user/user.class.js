class User {
  constructor(socket, id) {
    this.id = id; // uuid
    this.socket = socket;
    this.email = null;
    this.name = null;
  }

  updateUserInfo(name, email) {
    this.name = name;
    this.email = email;
  }
}
