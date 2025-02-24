import Game from './game.class.js';

class GameSession {
  constructor() {
    this.games = new Map(); // key : roomId, value : room
  }

  // 게임 추가하기
  addGame(gameId, ownerId) {
    const game = new Game(gameId, ownerId);
    this.games.set(gameId, game);
    return game;
  }

  // 게임 지우기
  removeGame(game) {
    game.gameEnd();
    this.games.delete(game.id);
  }

  // 방 조회
  getGame(gameId) {
    return this.games.get(gameId);
  }

  // 게임 전체 조회
  getGames() {
    return this.games;
  }
}

export default GameSession;
