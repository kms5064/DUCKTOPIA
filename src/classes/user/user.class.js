import { config } from "../../config/config.js";

class User {
  constructor(socket) {
    this.socket = socket;
    this.id = null; //클라이언트 접속시 id = null, 로그인했을때 id에 email 값 넣을 것임
    this.email = null;
    this.roomId = null; // game이 room 안에 있으므로 여기서 찾을 수 있습니다!
    this.state = null; // 'lobby', 'room', 'playing' 등 현재 상태 체크용
    this.name = null;
  }

  getUserData() {
    return {
      playerId: this.id,
      nickname: this.name,
    };
  }

  getFakeUserData() {
    return {
      playerId: this.id,
      nickname: this.name,
      characterData : {
        characterType: config.game.characterType.RED,
        hp: 0,
        weapon: 0,
        atk: 0,
      }
    };
  }

  // 로그인
  login(id, email, name) {
    this.id = id;
    this.email = email;
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
    this.state = 'lobby';
  }
  //게임 종료
  gameEnd() {
    this.state = 'lobby';
  }

}

export default User;
