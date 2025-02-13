import makePacket from '../../utils/packet/makePacket.js';
import { getGameAssets } from '../../init/assets.js';
import Monster from './monster.class.js';
import Player from './player.class.js';
import { config } from '../../config/config.js';
import { PACKET_TYPE } from '../../config/constants/header.js';
import { DayPhase, WaveState } from '../../config/constants/game.js';

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
    this.highLatency = 120; //플레이어들 가운데 제일 높은 레이턴시 값을 이걸로 하자. 플레이어 작업 하시는 분이 나중에 레이턴시 관리 해주시길.
    this.ownerId = ownerId;

    // 웨이브 시스템
    this.dayPhase = DayPhase.DAY;
    this.waveState = WaveState.NONE;
    this.dayCounter = 0;
    this.waveMonsters = new Map();

    // Zone
    this.zone = [
      { distance: 10.0, area: 1 }, // 중앙 근접 구역
      { distance: 20.0, area: 2 }, // 두 번째 구역
      { distance: 30.0, area: 3 }, // 세 번째 구역
    ];

    // 몬스터 스폰 구역
    this.monsterArea = {
      1: [1, 2, 3], // 중앙 근접 1
      2: [4, 5, 6], // 중앙 근접 2
      3: [7, 8], // 중앙 근접 3
    };
  }

  /********************
   * GAME
   */

  gameLoopStart() {
    if (this.gameLoop !== null) {
      return;
    }
    this.gameLoop = setInterval(() => {
      this.phaseCheck();
      // this.addMonster();
      this.monsterUpdate();
      //this.userUpdate();
      //밑의 것을 전부 monster들이 알아서 처리할 수 있도록 한다.
    }, 1000);
  }

  gameEnd() {
    clearInterval(this.gameLoop);
    this.gameLoop = null;
  }

  //다른 사람에게 전송(본인 제외)
  notification(socket, packet) {
    this.players.forEach((player) => {
      if (player.getUser().getSocket() !== socket) {
        player.getUser().getSocket().write(packet);
      }
    });
  }

  //다른 사람에게 전송(본인 포함)
  broadcast(packet) {
    this.players.forEach((player) => {
      player.getUser().getSocket().write(packet);
    });
  }

  /********************
   * PLAYER
   */

  addPlayer(user) {
    const player = new Player(user, 0, 0, 0);
    this.players.set(user.id, player);
  }

  getPlayerBySocket(socket) {
    const player = this.players.find((player) => player.user.socket === socket);
    return player;
  }
  removePlayer(userId) {
    this.players.delete(userId);
  }

  getPlayerById(userId) {
    return this.players.get(userId);
  }

  /********************
   * MONSTER
   */

  createMonsterData() {
    const monsterData = [];

    // 생성 제한 처리
    if (this.monsters.size >= config.game.monster.maxSpawnCount) {
      return;
    }
    const maxAmount = config.game.monster.maxSpawnCount - this.monsters.size;

    for (let i = 1; i <= maxAmount; i++) {
      const monsterId = this.monsterIndex;
      // Monster Asset 조회
      const { monster: monsterAsset } = getGameAssets();

      // 몬스터 데이터 뽑기
      const codeIdx = Math.floor(Math.random() * config.game.monster.normalMonsterMaxCode);
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
      );

      this.monsters.set(monsterId, monster);
      this.monsterIndex++; //Index 증가

      monsterData.push({
        monsterId,
        monsterCode: monster.monsterCode,
      });
    }
    return monsterData;
  }

  updateMonsterPosition(monsterId, x, y) {
    this.monsters.get(monsterId).setPosition(x, y);
  }

  addMonster() {
    // 몬스터 데이터 생성
    const monsterData = this.createMonsterData();

    // 패킷 생성
    const packet = makePacket(config.packetType.S_MONSTER_SPAWN_REQUEST, { monsters: monsterData });

    const owner = this.getPlayerById(this.ownerId);
    owner.socket.write(packet); // Host 에게 전송
  }

  getMonsterById(monsterId) {
    return this.monsters.get(monsterId);
  }

  getAllMonster() {
    return this.monsters;
  }

  removeMonster(monsterId) {
    this.monsters.delete(monsterId);

    // 웨이브 몬스터 삭제
    if (this.waveMonsters.has(monsterId)) {
      this.waveMonsters.delete(monsterId);
      if (this.waveMonsters.size === 0) this.setWaveState(WaveState.NONE);
    }
  }

  removeAllMonster() {
    this.monsters.clear();
    this.waveMonsters.clear();
  }

  userUpdate() {
    for (const player of this.players) {
      //console.log(player.x, player.y);
    }
  }

  monsterUpdate() {
    this.monsterDisCovered();
    //
    this.monsterMove(this.highLatency);
    //몬스터가 플레이어를 잃는 과정
    this.monsterLostPlayerCheck();
  }

  monsterDisCovered() {
    for (const [key, monster] of this.monsters) {
      if (!monster.hasPriorityPlayer()) {
        for (const player of this.players) {
          monster.setTargetPlayer(player);
          if (monster.hasPriorityPlayer()) {
            console.log('플레이어가 등록됨');
            const monsterDiscoverPayload = {
              monsterId: monster.id,
              targetId: player.id,
            };

            const packet = makePacket(
              config.packetType.S_MONSTER_AWAKE_NOTIFICATION,
              monsterDiscoverPayload,
            );
            this.broadcast(packet);
          }
        }
      }
    }
  }

  //플레이어가 등록된 몬스터들만 위치 패킷을 전송하는 게 좋겠다.
  monsterMove(deltaTime) {
    for (const [key, monster] of this.monsters) {
      if (!monster.hasPriorityPlayer()) {
        continue;
      } else {
        const monsterMovePayload = {
          monsterId: monster.getId(),
          direct: monster.getDirectByPlayer(),
          position: monster.getPosition(),
          speed: monster.getSpeed(),
          timestamp: deltaTime,
        };
        //위치로 이동시키는 개념이라 전체 브로드캐스팅을 해도 문제는 없어 보임.
        const packet = makePacket(
          config.packetType.S_MONSTER_MOVE_NOTIFICATION,
          monsterMovePayload,
        );
        this.broadcast(packet);
      }
    }
  }

  monsterLostPlayerCheck() {
    for (const [key, monster] of this.monsters) {
      if (monster.hasPriorityPlayer()) {
        monster.lostPlayer();
      }
    }
  }

  checkSpawnArea(monsterCode, x, y) {
    const distanceX = Math.abs(config.game.map.centerX - x);
    const distanceY = Math.abs(config.game.map.centerY - y);

    let area = 4; // 최대 구역 4
    for (const zone of this.zone) {
      if (distanceX <= zone.distance && distanceY <= zone.distance) {
        area = zone.area;
        return;
      }
    }
    return this.monsterArea[area].includes(monsterCode);
  }

  /********************
   * WAVE
   */

  changePhase() {
    if (this.dayPhase === DayPhase.DAY) this.dayPhase = DayPhase.NIGHT;
    else this.dayPhase = DayPhase.DAY;
  }

  setWaveState(state) {
    this.waveState = state;
  }

  // 웨이브 몬스터 생성
  addWaveMonster() {
    const monstersData = [];
    for (let i = 1; i <= config.game.monster.waveMaxMonsterCount; i++) {
      const monsterId = this.monsterIndex;
      // Monster Asset 조회
      const { monster: monsterAsset } = getGameAssets();
      // 몬스터 데이터 뽑기
      const codeIdx =
        Math.floor(
          Math.random() *
            (config.game.monster.waveMonsterMaxCode - config.game.monster.waveMonsterMinCode + 1),
        ) + config.game.monster.waveMonsterMinCode;
      const data = monsterAsset.data[0];

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

      // 몬스터 id와 code 저장
      monstersData.push({
        monsterId,
        monsterCode: monster.monsterCode,
      });
    }

    // 패킷 전송
    const monsterSpawnRequestPacket = makePacket(config.packetType.S_MONSTER_SPAWN_REQUEST, {
      monsters: monstersData,
    });

    const owner = this.getPlayerById(this.ownerId);

    owner.socket.write(monsterSpawnRequestPacket);

    this.setWaveState(WaveState.INWAVE);
  }

  phaseCheck() {
    // 데이 카운터 감소
    const now = Date.now();
    const deltaTime = now - this.lastUpdate;
    this.dayCounter += deltaTime;
    this.lastUpdate = now;

    // 현재 phase 에 따라 기준 다르게 받기
    if (this.dayCounter >= config.game.phaseCount[this.dayPhase]) {
      if (this.dayPhase === DayPhase.DAY) {
        this.addWaveMonster();
      }

      this.changePhase();

      this.dayCounter = 0;
    }
  }

  /********************
   * CORE
   */

  coreDamaged(damage) {
    this.coreHp -= damage;
    if (this.coreHp <= 0) {
      this.gameEnd();
    }
    return this.coreHp;
  }
}

export default Game;
