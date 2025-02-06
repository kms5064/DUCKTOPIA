class Game {
  constructor(uuid) {
    this.id = uuid;
    this.players = [];
    this.monsters = [];
    this.map = []; //0과 1로 된 2차원배열?
  }

  addPlayer(player){
    this.players.push(player);
    console.log(`addPlayer : ${player}`);
  }

  getPlayer(playerId) {
    const player = this.players.find((player)=>player.id === playerId);
    console.log(`getPlayer : ${player}`);
    return player;
  }

  removePlayer(playerId){
    this.players = this.players.filter((player) => player.id !== playerId);
    console.log(`removedPlayerId : ${playerId}`);
  }

  addMonster(monster){
    this.monsters.push(monster);
    console.log(`addMonster : ${monster}`);
  }

  getMonster(monsterId){
    const monster = this.monsters.find((monster)=>monster.id === monsterId);
    console.log(`getMonster : ${monster}`);
    return monster;
  }
  
  removeMonster(monsterId){
    this.monsters = this.monsters.filter((monster) => monster.id !== monsterId);
    console.log(`removedMonsterId : ${monsterId}`);
  }
  
  addMap(map){
    this.map = map;
  }

}

export default Game;

