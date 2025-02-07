// class User {
//   constructor(socket, id) {
//     this.id = id; // uuid
//     this.socket = socket;
//     this.email = null;
//     this.name = null;
//   }

//   updateUserInfo(name, email) {
//     this.name = name;
//     this.email = email;
//   }
// }

class User {
  constructor(socket, id, nickname, characterType) {
    this.id = id; //클라이언트 접속시 id = null, 로그인했을때 id에 email 값 넣을 것임
    this.roomId = null;
    this.socket = socket;
    this.state = null; // 'lobby', 'room', 'playing' 등 현재 상태 체크용
    this.name = nickname;
    this.characterType = characterType;
    this.hp = 100;
    this.weapon = null;
    this.atk = 10;
    this.x = 0;
    this.y = 0;
  }

  getCharacter() {
    return {
      characterType: this.characterType,
      hp: this.hp,
      weapon: this.weapon,
      atk: this.atk,
    };
  }

  getUserData() {
    return {
      playerId: this.id,
      nickname: this.name,
      character: this.getCharacter(),
    };
  }


  // 로그인
  login(userId, name) {
    this.id = userId;
    this.name = name;
    this.state = 'lobby';
  }
  // 방 입장
  enterRoom(roomId) {
    this.roomId = roomId;
    this.state = 'room';
  }
  // 게임 시작
  gameStart() {
    this.state = 'playing';
  }
  // 로그 아웃
  logout() {
    this.id = null;
  }
  // 방 퇴장
  exitRoom() {
    this.roomId = null;
  }
  //게임 종료
  gameEnd() {
    this.state = 'lobby';
  }
  //소켓 조회
  getSocket() {
    return this.socket;
  }
}

export default User;
