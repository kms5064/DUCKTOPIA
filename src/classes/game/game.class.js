import makePacket from '../../utils/packet/makePacket.js';
import { getGameAssets } from '../../init/assets.js';
import Monster from './monster.class.js';
import Player from './player.class.js';
import { config } from '../../config/config.js';
import { PACKET_TYPE } from '../../config/constants/header.js';
import { DayPhase, FRAME_PER_40, WaveState } from '../../config/constants/game.js';
import {
  MIN_COOLTIME_MONSTER_TRACKING,
  RANGE_COOLTIME_MONSTER_TRACKING,
} from '../../config/constants/monster.js';
import ItemBox from '../item/itemBox.class.js';
import ItemManager from '../item/itemManager.class.js';

class Game {
  constructor(ownerId) {
    this.players = new Map();
    this.monsterIndex = 1;
    this.monsters = new Map();
    // this.itemBoxes = new Map();
    this.object = new Map();
    this.map = []; // 0과 1로 된 2차원배열?
    this.coreHp = config.game.core.maxHP;
    this.corePosition = config.game.core.position;
    this.lastUpdate = 0;
    this.gameLoop = null;
    this.highLatency = 120;
    this.ownerId = ownerId;

    // 웨이브 시스템
    this.dayPhase = DayPhase.DAY;
    this.waveState = WaveState.NONE;
    this.dayCounter = 0;
    this.waveMonsters = new Map();

    // 아이템 관리
    this.itemManager = new ItemManager();

    //몬스터 쿨타임
    this.monsterLastUpdate = Date.now();
  }

  /**************
   * GAME
   */
  gameLoopStart() {
    if (this.gameLoop !== null) {
      return;
    }
    this.gameLoop = setInterval(() => {
      // this.addMonster();
      this.phaseCheck();
      this.monsterUpdate();
      //밑의 것을 전부 monster들이 알아서 처리할 수 있도록 한다.
    }, 1000);
    this.lastUpdate = Date.now();
  }

  gameEnd() {
    clearInterval(this.gameLoop);
    this.gameLoop = null;
  }

  //다른 사람에게 전송(본인 제외)
  notification(socket, packet) {
    this.players.forEach((player) => {
      const playerSocket = player.getUser().getSocket();
      if (playerSocket !== socket) {
        playerSocket.write(packet);
      }
    });
  }

  //다른 사람에게 전송(본인 포함)
  broadcast(packet) {
    this.players.forEach((player) => {
      player.getUser().getSocket().write(packet);
    });
  }

  /**************
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
      const codeIdx = Math.floor(Math.random() * 7);
      const data = monsterAsset.data[codeIdx];

      // 몬스터 생성
      const monster = new Monster(
        monsterId,
        data.monsterCode,
        data.name,
        data.hp,
        data.attack,
        data.defence,
        5,
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
    owner.getUser().getSocket().write(packet); // Host 에게 전송
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

  monsterAttackCheck(monsterId) {
    const monsterIndex = this.monsters[monsterId];
  }

  monsterUpdate() {
    //몬스터가 플레이어의 거리를 구해서 발견한다.
    this.monsterDisCovered();
    //몬스터가 플레이어를 가지고 있을 경우 움직인다.
    //this.monsterMove();
    //몬스터가 플레이어를 잃는 과정
    //this.monsterLostPlayerCheck();
  }

  monsterDisCovered() {
    const monsterDiscoverPayload = [];
    for (const [key, monster] of this.monsters) {
      // 대상이 없는 몬스터만
      if (!monster.hasPriorityPlayer()) {
        for (const [playerId, player] of this.players) {
          // 대상 찾아보기
          monster.setTargetPlayerByDistance(player);
          if (monster.hasPriorityPlayer()) {
            console.log('플레이어가 등록됨');
            monsterDiscoverPayload.push({
              monsterId: monster.id,
              targetId: playerId,
            });
          }
        }
      }
    }
    const packet = makePacket(config.packetType.S_MONSTER_AWAKE_NOTIFICATION, {
      monsterTarget: monsterDiscoverPayload,
    });
    this.broadcast(packet);
  }

  //플레이어가 등록된 몬스터들만 위치 패킷을 전송하는 게 좋겠다.
  //플레이어 타겟이 정해져 있지 않다면 무조건 코어 쪽으로 이동시키도록 한다.
  monsterMove() {
    for (const [key, monster] of this.monsters) {
      if (!monster.hasPriorityPlayer()) {
        const monsterPos = monster.getPosition();
        const distanceFromCore = Math.sqrt(Math.pow(monsterPos.x, 2) + Math.pow(monsterPos.y, 2));
        const direct_x = (monsterPos.x / distanceFromCore) * monster.getSpeed();
        const direct_y = (monsterPos.y / distanceFromCore) * monster.getSpeed();

        const monsterMoverPayload = {
          monsterId: monsterId,
          targetId: targetId,
          x: monsterPos.x,
          y: monsterPos.y,
        };
        //위치로 이동시키는 개념이라 전체 브로드캐스팅을 해도 문제는 없어 보임.
        const packet = makePacket(PACKET_TYPE.S_MONSTER_MOVE_NOTIFICATION, monsterMoverPayload);
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

  /**************
   * CORE
   */
  coreDamaged(damage) {
    this.coreHp -= damage;
    if (this.coreHp <= 0) {
      this.gameEnd();
    }
    return this.coreHp;
  }

  /**************
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

      // 몬스터 데이터 뽑기
      const codeIdx =
        Math.floor(
          Math.random() *
            (config.game.monster.waveMonsterMaxCode - config.game.monster.waveMonsterMinCode + 1),
        ) + config.game.monster.waveMonsterMinCode;

      this.monsterIndex++; //Index 증가

      // 몬스터 id와 code 저장
      monstersData.push({
        monsterId,
        monsterCode: codeIdx,
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

  spawnWaveMonster(monsters) {
    for (const monster of monsters) {
      // Monster Asset 조회
      const { monster: monsterAsset } = getGameAssets();

      const data = monsterAsset.data.find((asset) => asset.monsterCode === monster.monsterCode);

      console.log(monsterAsset.data);

      // 몬스터 생성
      const spawnMonster = new Monster(
        monster.monsterId,
        monster.monsterCode,
        data.name,
        data.hp,
        data.attack,
        data.defence,
        data.range,
        data.speed,
        monster.x,
        monster.y,
        true,
      );

      this.monsters.set(monster.monsterId, spawnMonster);
      this.waveMonsters.set(monster.monsterId, spawnMonster);
    }
  }

  phaseCheck() {
    // 데이 카운터 감소
    const now = Date.now();
    const deltaTime = now - this.lastUpdate;
    this.dayCounter += deltaTime;
    this.lastUpdate = now;

    // 현재 phase 에 따라 기준 다르게 받기
    if (this.dayCounter >= config.game.phaseCount[this.dayPhase]) {
      this.changePhase();

      if (this.dayPhase === DayPhase.DAY) {
        this.addWaveMonster();
      }

      this.dayCounter = 0;
    }
  }

  //테스트용 코드
  addBox() {
    const itemBox = new ItemBox(2, 0, 0);
    this.itemBoxes.set(itemBox.id, itemBox);
  }
  /////////////////////////////////////
}

export default Game;
