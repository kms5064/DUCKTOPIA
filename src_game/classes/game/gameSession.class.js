import Game from './game.class.js';

/* GameSession 클래스 */
class GameSession {
  constructor() {
    this.games = new Map();
  }

  addGame(gameId, user) {
    if (this.games.has(gameId)) {
      this.games.get(gameId).addPlayer(user);
    } else {
      const game = new Game();
      this.games.set(gameId, game);
      game.addPlayer(user);
    }
  }

  getGameById(gameId) {
    return this.games.get(gameId);
  }

  deleteGame(gameId) {
    this.game.delete(gameId);
  }
}

export default GameSession;
