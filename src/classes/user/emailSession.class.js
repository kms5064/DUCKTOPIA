class EmailSession {
  constructor() {
    this.emails = new Map(); // key : email, value : socket
  }

  // 로그인 시 이메일 추가
  addEmail(email, socket) {
    if (this.emails.has(email)) {
      // 중복 로그인이면 기존 로그인된 소켓 연결 종료
      const existingSocket = this.emails.get(email);
      existingSocket.disconnect(); // 기존 소켓 연결 종료
      this.emails.delete(email);
    }

    this.emails.set(email, socket);
  }

  deleteEmail(email) {
    this.emails.delete(email);
  }
}

export default EmailSession;
