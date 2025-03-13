import { redisClient } from '../../db/redis/redis.js';
import Game from './game.class.js';

class GameSession {
  constructor() {
    this.name = null;
    this.games = new Map(); // key : roomId, value : room
  }

  // 게임 추가하기
  async addGame(gameId, ownerId) {
    const game = new Game(gameId, ownerId);
    this.games.set(gameId, game);
    await redisClient.hSet(this.name, 'games', this.games.size); //object Map
    return game;
  }

  // 게임 지우기
  async removeGame(game, userId = null, isClear = null) {
    if(userId !== game.ownerId) {
      game.removePlayer(userId)
      return
    } 
    await game.gameEnd(isClear);
    this.games.delete(game.id);
    await redisClient.hSet(this.name, 'games', this.games.size);
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
