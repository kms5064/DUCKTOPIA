import makePacket from '../../utils/packet/makePacket.js';
import { getGameAssets } from '../../init/assets.js';
import Monster from './monster.class.js';
import Player from './player.class.js';
import { config } from '../../config/config.js';
import {
  WAVE_MAX_MONSTER_COUNT,
  WAVE_MONSTER_MAX_CODE,
  WAVE_MONSTER_MIN_CODE,
} from '../../config/constants/monster.js';

const DayPhase = {
  DAY: 0,
  NIGHT: 1,
};
Object.freeze(DayPhase);

const WaveState = {
  NONE: 0,
  INWAVE: 1,
};
Object.freeze(WaveState);

class Game {
  constructor(ownerId) {
    this.players = new Map();
    this.monsterIndex = 1;
    this.monsters = new Map();
    this.map = []; // 0과 1로 된 2차원배열?
    this.coreHp = config.game.core.maxHP;
    this.corePosition = config.game.core.position;
    this.lastUpdate = 0;
    this.gameLoop = null;
    this.ownerId = ownerId;

    // 웨이브 시스템
    this.dayPhase = DayPhase.DAY;
    this.waveState = WaveState.NONE;
    this.dayCounter = 0;
    this.waveMonsters = new Map();
  }

  addPlayer(player) {
    this.players.push(player);
    console.log(`addPlayer : ${player}`);
  }

  getPlayerById(playerId) {
    const player = this.players.find((player) => player.id === playerId);
    console.log(`getPlayer : ${player}`);
    return player;
  }

  addPlayer(user) {
    const player = new Player(user, 0, 0, 0);
    this.players.set(user.id, player);
  }

  removePlayer(userId) {
    this.players.delete(userId);
  }

  getPlayerById(userId) {
    return this.players.get(userId);
  }

  addMonster() {
    // 생성 제한 처리
    if (this.monsters.size >= config.game.monster.maxSpawnCount) {
      return;
    }

    // TODO : 한번에 생성할지 프레임단위로 단일 생성할지 성능보고?
    // maxAmount 만큼 몬스터 생성
    const maxAmount = config.game.monster.maxSpawnCount - this.monsters.size;

    for (let i = 1; i <= maxLeng; i++) {
      const monsterId = this.monsterIndex;
      // Monster Asset 조회
      const { monster: monsterAsset } = getGameAssets();
      // 몬스터 데이터 뽑기
      const codeIdx = Math.floor(Math.random() * monsterAsset.data.length);
      const data = monsterAsset.data[codeIdx];

      // 좌표 생성
      let x =
        Math.random() * (config.game.map.endX - config.game.map.startX) + config.game.map.startX;
      let y =
        Math.random() * (config.game.map.endY - config.game.map.startY) + config.game.map.startY;

      // 몬스터 생성
      const monster = new Monster(
        monsterId,
        data.monsterCode,
        data.name,
        data.hp,
        data.attack,
        data.defence,
        data.range,
        data.speed,
        x,
        y,
      );

      this.monsters.set(monsterId, monster);
      this.monsterIndex++; //Index 증가

      // 페이로드
      const payload = {
        monsterId,
        code: monster.monsterCode,
        x,
        y,
      };
      const packet = makePacket(PACKET_TYPE.MONSTER_SPAWN_NOTIFICATION, payload);
      this.broadcast(packet);
    }
  }

  addWaveMonster() {
    for (let i = 1; i <= WAVE_MAX_MONSTER_COUNT; i++) {
      const monsterId = this.monsterIndex;
      // Monster Asset 조회
      const { monster: monsterAsset } = getGameAssets();
      // 몬스터 데이터 뽑기
      const codeIdx =
        Math.floor(Math.random() * (WAVE_MONSTER_MAX_CODE - WAVE_MONSTER_MIN_CODE + 1)) +
        WAVE_MONSTER_MIN_CODE;
      const data = monsterAsset.data[codeIdx];

      // 몬스터 생성
      const monster = new Monster(
        monsterId,
        data.monsterCode,
        data.name,
        data.hp,
        data.attack,
        data.defence,
        data.range,
        data.speed,
        0,
        0,
        true,
      );

      this.monsters.set(monsterId, monster);
      this.waveMonsters.set(monsterId, monster);
      this.monsterIndex++; //Index 증가

      // 페이로드
      const payload = {
        monsterId,
        code: monster.monsterCode,
      };

      const monsterSpawnRequestPacket = makePacket(
        config.packetType.S_MONSTER_SPAWN_REQUEST,
        payload,
      );

      const owner = this.getPlayerById(this.ownerId);

      if (!owner) {
        throw new CustomError('방장이 존재하지 않습니다.');
      }

      owner.socket.write(monsterSpawnRequestPacket);
    }
  }

  getMonster(monsterId) {
    return this.monsters.get(monsterId);
  }

  getAllMonster() {
    return this.monsters;
  }

  removeMonster(monsterId) {
    this.monsters.delete(monsterId);

    if (this.waveMonsters.has(monsterId)) {
      this.waveMonsters.delete(monsterId);
    }
  }

  removeAllMonster() {
    this.monsters.clear();
    this.waveMonsters.clear();
  }

  //다른 사람에게 전송(본인 제외)
  notification(socket, packet) {
    this.players.forEach((player) => {
      if (player.getUser().getSocket() !== socket) {
        player.getUser().getSocket().write(packet);
      }
    });
  }

  //전체 전송 (본인 포함)
  broadcast(packet) {
    this.players.forEach((player) => {
      const socket = player.getUser().getSocket();
      socket.write(packet);
    });
  }
  gameLoopStart() {
    if (this.gameLoop !== null) {
      return;
    }
    this.gameLoop = setInterval(() => {
      if (!this.game) {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
      } else {
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
      } else {
        monster.moveByLatency(latency); //S2CMonsterMoveNotification을 보낸다

        const monsterMovePayload = {
          monsterId: monster.id,
          x: monster.x,
          y: monster.y,
        };
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

  coreDamaged(damage) {
    this.coreHp -= damage;
    if (this.coreHp <= 0) {
      this.gameEnd();
    }
    return this.coreHp;
  }

  gameEnd() {
    clearInterval(this.gameLoop);
    this.gameLoop = null;
    this.broadcast(makePacket(PACKET_TYPE.GAME_END_NOTIFICATION));
  }
}

export default Game;
