import makePacket from '../../utils/packet/makePacket.js';
import { getGameAssets } from '../../init/assets.js';
import Monster from './monster.class.js';
import Player from './player.class.js';
import { config } from '../../config/config.js';
import { DayPhase, WaveState } from '../../config/constants/game.js';
import ItemBox from '../item/itemBox.class.js';
import ItemManager from '../item/itemManager.class.js'; import { MAX_NUMBER_OF_ITEM_BOX } from '../../config/constants/itemBox.js';
import BossMonster from './bossMonster.class.js';

class Game {
  constructor(ownerId) {
    this.players = new Map();
    this.monsterIndex = 1;
    this.monsters = new Map();//보스 몬스터도 monsters 내부에 넣을 수 있다.
    this.objects = new Map();
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

    //몬스터 쿨타임
    //보스 몬스터까지 이걸 이용해 관리하면 될 듯 하다.
    this.monsterLastUpdate = Date.now();

    // 아이템 관리 : 2025.02.21 추가
    this.itemManager = new ItemManager();
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
      this.monsterTimeCheck();
      //밑의 것을 전부 monster들이 알아서 처리할 수 있도록 한다.
    }, 1000);
    this.lastUpdate = Date.now();
    this.monsterLastUpdate = Date.now();
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
    const player = new Player(user, 100, 0, 0);
    this.players.set(user.id, player);
  }

  getPlayerBySocket(socket) {
    return this.players.find((player) => player.user.socket === socket);
  }
  removePlayer(userId) {
    this.players.delete(userId);
  }

  getPlayerById(userId) {
    return this.players.get(userId);
  }

  userUpdate() {
    for (const player of this.players) {
      //console.log(player.x, player.y);
    }
  }

  /**************
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
      const codeIdx = Math.floor(Math.random() * 7);
      const data = monsterAsset.data[codeIdx];

      // 몬스터 생성
      const monster = new Monster(
        monsterId,
        data.code,
        data.name,
        data.hp,
        data.attack,
        data.defence,
        data.grade,
        data.range,
        data.speed,
        0,
        0,
      );

      this.monsters.set(monsterId, monster);
      this.monsterIndex++; //Index 증가

      monsterData.push({
        monsterId,
        monsterCode: monster.code,
      });
    }
    return monsterData;
  }

  //보스를 생성할 때는 별도로 보스 생성 함수를 사용하자.
  createBossMonsterData() {
    if (config.game.monster.maxSpawnCount <= this.monsters.size) {
      return;
    }

    const monsterId = this.monsterIndex;
    // Monster Asset 조회
    const { monster: monsterAsset } = getGameAssets();

    // 몬스터 데이터 뽑기
    const codeIdx = Math.floor(Math.random() * 7);
    const data = monsterAsset.data[codeIdx];

    // 몬스터 생성
    const bossMonster = new BossMonster(
      monsterId,
      data.code,
      data.name,
      data.hp,
      data.attack,
      data.defence,
      data.grade,
      data.range,
      data.speed,
      0,
      0,
    );

    this.monsters.set(monsterId, bossMonster);
    this.monsterIndex++; //Index 증가

    monsterData.push({
      monsterId,
      monsterCode: bossMonster.code,
    });
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

  //여기부터 몬스터 영역

  removeAllMonster() {
    this.monsters.clear();
    this.waveMonsters.clear();
  }

  monsterAttackCheck(monsterId) {
    const monsterIndex = this.monsters[monsterId];
  }

  monsterUpdate() {
    //몬스터가 플레이어의 거리를 구해서 발견한다.
    //몬스터의 거리가 너무 멀어지면 id값을 0이나 -1을
    this.monsterDisCovered();
    //몬스터y가 플레이어를 가지고 있을 경우 움직인다.
    //this.monsterMove();
    this.monsterTimeCheck();

    //몬스터의 사망 판정도 체크해 보도록 하자.

    //몬스터의 모든 업데이트가 monster업데이트 체크를 갱신하자.
    this.monsterLastUpdate = Date.now();
  }

  //현재는 각각의 몬스터의 정보를 단일로 보내고 있지만 나중에는 리스트를 통해 보내는 걸 생각해 보도록 하자.
  monsterDisCovered() {
    const monsterDiscoverPayload = [];
    for (const [monsterId, monster] of this.monsters) {
      if (monster.AwakeCoolTimeCheck()) continue;
      // 대상이 없는 몬스터만
      let distance = Infinity;
      let inputId = 0;
      let inputPlayer = null;
      if (!monster.hasTargetPlayer()) {
        //몬스터가 죽었을 때, hp가 0인데 반응이 나올 수 있으니 체크
        if (monster.monsterDeath()) {
          this.monsters.delete(monsterId);
          continue;
        }

        for (const [playerId, player] of this.players) {
          // 대상 찾아보기
          const calculatedDistance = monster.returnCalculateDistance(player);

          if (distance > calculatedDistance) {
            distance = calculatedDistance;
            inputId = playerId;
            inputPlayer = player;
          }
        }

        if (inputPlayer === null || inputPlayer.hp <= 0) continue;

        monster.setTargetPlayer(inputPlayer);
        //monster.setMonsterTrackingTime(5000);
        monsterDiscoverPayload.push({
          monsterId: monsterId,
          targetId: inputId,
        });
      } else {
        if (monster.lostPlayer()) {
          monsterDiscoverPayload.push({
            monsterId: monsterId,
            targetId: 0,
          });
          continue;
        }
        distance = monster.getDistanceByPlayer();

        for (const [playerId, player] of this.players) {
          // 대상 찾아보기
          const calculatedDistance = monster.returnCalculateDistance(player);

          if (distance > calculatedDistance) {
            distance = calculatedDistance;
            inputId = playerId;
            inputPlayer = player;
          }
        }

        if (inputPlayer !== null) {
          //타겟이 바뀌었을 때
          monster.setTargetPlayer(inputPlayer);
          monsterDiscoverPayload.push({
            monsterId: monsterId,
            targetId: inputId,
          });
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
  //
  monsterMove() {
    const monsterMoveList = [];

    for (const [monsterId, monster] of this.monsters) {
      const monsterPos = monster.getPosition();
      const targetId = monster.gettargetPlayer();

      const monsterMoverPayload = {
        monsterId: monsterId,
        targetId: targetId,
        x: monsterPos.x,
        y: monsterPos.y,
      };

      monsterMoveList.push(monsterMoverPayload);
    }
    const packet = makePacket(config.packetType.S_MONSTER_MOVE_NOTIFICATION, monsterMoveList);

    //이런 식으로 게임에서 notification을 보내보도록 하자.
    game.broadcast(packet);
  }

  monsterTimeCheck() {
    for (const [monsterId, monster] of this.monsters) {
      const now = Date.now();
      const deltaTime = now - this.monsterLastUpdate;
      monster.CoolTimeCheck(deltaTime);
    }
  }

  getItemBoxById(objectId) {
    return this.objects.get(objectId);
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

  getCoreHp() {
    const coreHp = this.coreHp;
    return coreHp;
  }

  createObjectData() {
    const objectData = [];
    const coreData = {
      ObjectData: { objectId: 1, objectCode: 1 },
      itemData: [],
      x: 0,
      y: 0,
    };

    objectData.push(coreData);
    for (let i = 0; i < MAX_NUMBER_OF_ITEM_BOX; i++) {
      const itemBox = this.createItemBox();
      objectData.push(itemBox);
    }
    return objectData;
  }

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

    const changePhasePacket = makePacket(config.packetType.S_GAME_PHASE_UPDATE_NOTIFICATION, {
      gameState: {
        phaseType: this.dayPhase,
        nextPhaseAt: this.lastUpdate + config.game.phaseCount[this.dayPhase],
      },
    });

    this.broadcast(changePhasePacket);
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

    owner.user.socket.write(monsterSpawnRequestPacket);

    this.setWaveState(WaveState.INWAVE);
  }

  spawnWaveMonster(monsters) {
    for (const monster of monsters) {
      // Monster Asset 조회
      const { monster: monsterAsset } = getGameAssets();

      const data = monsterAsset.data.find((asset) => asset.code === monster.monsterCode);

      // 몬스터 생성
      const spawnMonster = new Monster(
        monster.monsterId,
        monster.code,
        data.name,
        data.hp,
        data.attack,
        data.defence,
        5,
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

      if (this.dayPhase === DayPhase.NIGHT) {
        this.addWaveMonster();
      }

      this.dayCounter = 0;
    }
  }


  // 아이템 박스 생성
  createItemBox() {
    const boxId = this.itemManager.createBoxId();
    const itemBox = new ItemBox(boxId);

    // 랜덤 아이템 생성 및 박스에 추가
    const items = this.itemManager.generateRandomItems();
    items.forEach((item, index) => {
      itemBox.itemList.splice(index, 1, { itemCode: item.itemData.itemCode, count: item.itemData.count });
    });

    const data = {
      ObjectData: { objectId: itemBox.id, objectCode: 2 },
      itemData: itemBox.itemList,
      x: itemBox.x,
      y: itemBox.y,
    };

    this.objects.set(data.ObjectData.objectId, data);

    // 디버깅용 로그
    console.log(`[아이템 박스 생성] ID: ${boxId}, 위치: (${itemBox.x}, ${itemBox.y})`);
    console.log('[생성된 아이템 목록]');
    itemBox.itemList.forEach((item) => {
      if (item !== null) {
        if (item.itemCode !== null) {
          console.log(`아이템: ${JSON.stringify(item)}`);
          console.log(`아이템코드: ${item.itemCode}, 개수: ${item.count}`);
        }
        else {
          console.log(`아이템코드: null, 개수: ${item.count}`);
        }

      }

    });

    return data;
  }
}

export default Game;
