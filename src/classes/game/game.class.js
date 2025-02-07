import { getGameAssets } from "../../init/assets";

class Game {
  constructor(uuid) {
    this.id = uuid;
    this.players = [];
    this.monsters = [];
    this.map = []; //0과 1로 된 2차원배열?
    this.monsterAssets = getGameAssets().monster;
    this.lastUpdate = 0;
    this.maxStageX = 1000;
    this.maxStageY = 1000;
    this.centerStageX = 100;
    this.centerStageY = 100;
    this.gameLoop = null;
  }

  addRandomAllMonsterAfterGameStart() {
    //중간 지점이 플레이어라고 가정하고 중간 지점에서 벗어난 위치들에 몬스터를 생성하도록 한다.
    while (this.globalMonsters.size < maxMonsterCount) {
      const vecX = Math.floor(Math.random() * 2) === 1 ? 1 : -1;
      const vecY = Math.floor(Math.random() * 2) === 1 ? 1 : -1;
      const id = uuidV4();

      const summonX = vecX * (Math.random() * (this.maxStageX - this.centerStageX) + this.centerStageX);
      const summonY = vecY * (Math.random() * (this.maxStageY - this.centerStageY) + this.centerStageY);

      const monsterCode = Math.floor(Math.random() * this.monsterAssets.data.length);
      const monsterInfo = this.monsterAssets.data[monsterCode];

      const newMonster = new Monster(id, monsterCode, summonX, summonY, monsterInfo.range, monsterInfo.speed);
      this.monsters.push(newMonster);

    }
  }

  addPlayer(player) {
    this.players.push(player);
    console.log(`addPlayer : ${player}`);
  }

  getPlayer(playerId) {
    const player = this.players.find((player) => player.id === playerId);
    console.log(`getPlayer : ${player}`);
    return player;
  }

  removePlayer(playerId) {
    this.players = this.players.filter((player) => player.id !== playerId);
    console.log(`removedPlayerId : ${playerId}`);
  }

  addMonster(monster) {
    this.monsters.push(monster);
    console.log(`addMonster : ${monster}`);
  }

  getMonster(monsterId) {
    const monster = this.monsters.find((monster) => monster.id === monsterId);
    console.log(`getMonster : ${monster}`);
    return monster;
  }

  removeMonster(monsterId) {
    this.monsters = this.monsters.filter((monster) => monster.id !== monsterId);
    console.log(`removedMonsterId : ${monsterId}`);
  }

  addMap(map) {
    this.map = map;
  }

  //게임 루프를 시작한다고 하자
  gameLoopStart() {
    if (this.gameLoop !== null) {
      return;
    }
    this.gameLoop = setInterval(() => {
      if (!this.game) {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
      }
      else {
        const now = Date.now();
        const latency = now - this.lastUpdate;
        this.lastUpdate = Date.now();
        //업데이트를 보낼 때마다 
        //몬스터가 플레이어를 발견하는 과정
        this.monsterDisCovered();
        //
        this.monsterMove(latency);
        //몬스터가 플레이어를 잃는 과정
        this.monsterLostPlayerCheck();
      }
    }, 60);
  }

  monsterDisCovered() {
    for (const monster of this.monsters) {
      if (!monster.hasPriorityPlayer()) {
        for (const player of this.players) {
          monster.setTargetPlayer(player);
        }
      }
    }
  }

  monsterMove() {
    for (const monster of this.monsters) {
      if (!monster.hasPriorityPlayer()) {
        continue;
      }
      else {
        monster.moveByLatency(latency);//S2CMonsterMoveNotification을 보낸다

        const monsterMovePayload = {
          monsterId: monster.id,
          x: monster.x,
          y: monster.y
        }
        const packet = createResponse(packetNames[11], monsterMovePayload);
        this.game.broadcast(packet);
      }
    }
  }

  monsterLostPlayerCheck() {
    for (const monster of this.monsters) {
      if (monster.hasPriorityPlayer()) {
        monster.lostPlayer();
      }
    }
  }

}

export default Game;

