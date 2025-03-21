import { config } from '../../config/config.js';
import { redisClient } from '../../db/redis/redis.js';
import { getGameAssets } from '../../init/assets.js';
import { DayPhase, WaveState } from '../../config/constants/game.js';
import { gameSession, userSession } from '../../sessions/session.js';
import { MAX_NUMBER_OF_GRASS } from '../../config/constants/objects.js';
import Wall from '../object/wall.class.js';
import Core from '../core/core.class.js';
import Item from '../item/item.class.js';
import Grass from '../object/grass.class.js';
import Monster from './monster.class.js';
import ItemBox from '../item/itemBox.class.js';
import ItemManager from '../item/itemManager.class.js';
import BossMonster from './bossMonster.class.js';

class Game {
  constructor(gameId, ownerId) {
    this.id = gameId;
    this.ownerId = ownerId;

    this.users = new Map();
    this.monsters = new Map();
    this.objects = new Map();
    this.map = []; // 0과 1로 된 2차원배열?

    this.monsterIndex = 1;
    this.core = new Core(config.game.core.maxHP);
    this.corePosition = config.game.core.position;
    this.gameLoop = null;
    this.highLatency = 120;

    // 웨이브 시스템
    this.dayPhase = DayPhase.DAY;
    this.waveState = WaveState.NONE;
    this.dayCounter = 0;
    this.waveMonsters = new Map();
    this.bossMonsterWaveCount = 20;
    this.waveCount = 1;

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

    // 시간
    this.lastUpdate = 0;
    this.monsterLastUpdate = Date.now();

    // 아이템 관리 : 2025.02.21 추가
    this.itemManager = new ItemManager();

    this.loopCheck = 0;
    this.monsterMoveQueue = [];

    this.revivalList = [];

    this.bossMonsterWaveCount = 20;
  }

  /**************
   * GAME
   */

  gameLoopStart() {
    if (this.gameLoop !== null) {
      return;
    }
    this.gameLoop = setInterval(() => {
      this.playerMoveUpdate();
      this.monsterMoveUpdate();
      this.loopCheck++;
      if (this.loopCheck < 5) {
        return;
      }
      this.phaseCheck();
      this.monsterUpdate();
      this.playersHungerCheck();
      this.loopCheck = 0;
    }, 200);
    this.lastUpdate = Date.now();
    this.initPlayersHunger();
  }

  async gameEnd(isClear = false) {
    clearInterval(this.gameLoop);
    const userIds = [];
    this.gameLoop = null;
    let gameEndNotification;
    if (isClear) {
      gameEndNotification = [config.packetType.S_GAME_CLEAR_NOTIFICATION, {}];
    } else {
      gameEndNotification = [config.packetType.S_GAME_OVER_NOTIFICATION, {}];
    }

    this.broadcast(gameEndNotification);
    this.users.forEach((user) => {
      userIds.push(user.id);
      userSession.deleteUser(user.id);
    });
    // Gateway의 user 정보 업데이트용
    await redisClient.publish(config.redis.custom + 'UserGameEnd', userIds.join(','));
    // Lobby의 roomId 삭제용
    await redisClient.publish(config.redis.custom + 'RemoveRoom', String(this.id));
  }

  // 전체 공지(본인 제외)
  notification(id, packetInfos) {
    this.users.forEach((user) => {
      if (user.id !== id) user.sendPacket(packetInfos);
    });
  }

  // 전체 공지(본인 포함)
  broadcast(packetInfos) {
    this.users.forEach((user) => {
      user.sendPacket(packetInfos);
    });
  }

  /**************
   * USER -> PLAYER
   */
  addUser(user) {
    this.users.set(user.id, user);
  }

  getPlayerBySocket(socket) {
    return this.users.find((user) => user.socket === socket).player;
  }

  removePlayer(userId) {
    this.users.delete(userId);
  }

  getUserById(userId) {
    return this.users.get(userId);
  }

  initPlayersHunger() {
    for (const [id, user] of this.users) {
      user.player.initHungerUpdate();
    }
  }

  playersHungerCheck() {
    for (const [id, user] of this.users) {
      user.player.hungerCheck();
    }
  }

  getUsersPositionData() {
    const positions = [];
    let i = 1;
    this.users.forEach((user) => {
      // 새로운 x, y 값 계산
      const newX = i * 3;
      const newY = i * 3;

      // 유저 위치 업데이트
      user.player.playerPositionUpdate(newX, newY);
      // 업데이트된 위치 정보 반환
      positions.push({
        playerId: user.id,
        x: user.player.x, // 업데이트된 값
        y: user.player.y, // 업데이트된 값
      });
      i++;
    });
    return positions;
  }

  playerMoveUpdate() {
    const playerPositions = [];
    for (const [userId, user] of this.users) {
      const playerPosition = {
        playerId: userId,
        x: user.player.x,
        y: user.player.y,
      };
      playerPositions.push(playerPosition);
    }

    // payload 인코딩
    const packet = [
      config.packetType.S_PLAYER_POSITION_UPDATE_NOTIFICATION,
      {
        playerPositions,
      },
    ];

    // 룸 내 인원에게 브로드캐스트
    this.broadcast(packet);
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
      const monsterId = this.monsterIndex++;
      // Monster Asset 조회

      // const monsterList = [0, 1, 2, 3, 4, 5, 6];
      // 몬스터 데이터 뽑기
      let codeIdx = 0;
      if (i < 30) {
        codeIdx = 0;
      } else if (i < 60) {
        codeIdx = 1;
      } else if (i < 90) {
        codeIdx = 2;
      } else if (i < 120) {
        codeIdx = 3;
      } else if (i < 170) {
        codeIdx = 4;
      } else if (i < 220) {
        codeIdx = 5;
      } else {
        codeIdx = 6;
      }

      const { monster: monsterAsset } = getGameAssets();
      const data = monsterAsset.data[codeIdx];

      if (i < maxAmount) {
        const monster = new Monster(
          monsterId,
          data.code,
          data.name,
          data.hp,
          data.attack,
          data.defence,
          data.range,
          data.speed,
          data.grade,
          0,
          0,
        );

        this.monsters.set(monsterId, monster);
        monsterData.push({
          monsterId,
          monsterCode: monster.code,
        });
      } else {
        monsterData.push(this.createBossMonsterData());
      }
      // 몬스터 생성
    }
    return monsterData;
  }

  //보스 몬스터의 생성
  createBossMonsterData(isWave = false, pos_x = 0, pos_y = 0) {
    //몬스터의 숫자가 최대 숫자보다 크다면 보스 몬스터는 잠시 지연하도록
    if (config.game.monster.maxSpawnCount <= this.monsters.size) {
      return;
    }

    const { monster: monsterAsset } = getGameAssets();
    const data = monsterAsset.data[7];

    const monsterId = this.monsterIndex++;
    const bossMonster = new BossMonster(
      monsterId,
      208,
      data.name,
      data.hp,
      data.attack,
      data.defence,
      data.range,
      data.speed,
      data.grade,
      pos_x,
      pos_y,
      isWave,
    );

    this.monsters.set(monsterId, bossMonster);
    return {
      monsterId,
      monsterCode: bossMonster.code,
    };
  }

  updateMonsterPosition(monsterId, x, y) {
    if (this.monsters.has(monsterId)) {
      this.monsters.get(monsterId).setPosition(x, y);
    }

    if (this.waveMonsters.has(monsterId)) {
      this.waveMonsters.get(monsterId).setPosition(x, y);
    }
  }

  getMonsterById(monsterId) {
    if (this.monsters.has(monsterId)) {
      return this.monsters.get(monsterId);
    }

    if (this.waveMonsters.has(monsterId)) {
      return this.waveMonsters.get(monsterId);
    }
  }

  getAllMonster() {
    return this.monsters;
  }

  getAllWaveMonster() {
    return this.waveMonsters;
  }

  removeMonster(monsterId) {
    //몬스터의 삭제
    if (this.monsters.has(monsterId)) {
      this.monsters.delete(monsterId);
    }

    // 웨이브 몬스터 삭제
    if (this.waveMonsters.has(monsterId)) {
      this.waveMonsters.delete(monsterId);
      if (this.waveMonsters.size === 0) this.setWaveState(WaveState.NONE);
    }
  }

  //여기부터 몬스터 영역
  monsterUpdate() {
    this.monsterDisCovered(); //몬스터가 플레이어를 등록, 해제 하는 걸 담당
    this.monsterMove(); //몬스터 내부의 행동 패턴 등을 담당
    this.monsterTimeCheck(); //몬스터 내부의 시간 체크 담당

    //몬스터의 사망 판정도 체크해 보도록 하자.

    //몬스터의 모든 업데이트가 monster업데이트 체크를 갱신하자.
    this.monsterLastUpdate = Date.now();
  }

  //현재는 각각의 몬스터의 정보를 단일로 보내고 있지만 나중에는 리스트를 통해 보내는 걸 생각해 보도록 하자.
  monsterDisCovered() {
    const monsterDiscoverPayload = [];
    for (const [monsterId, monster] of this.monsters) {
      if (monster.AwakeCoolTimeCheck()) {
        continue;
      }
      // 대상이 없는 몬스터만
      let distance = Infinity;
      let inputId = 0;
      let inputPlayer = null;
      if (!monster.hasTargetPlayer()) {
        for (const [userId, user] of this.users) {
          // 대상 찾아보기
          const calculatedDistance = monster.returnCalculateDistance(user.player);

          if (distance > calculatedDistance) {
            distance = calculatedDistance;
            inputId = userId;
            inputPlayer = user.player;
          }
        }

        if (inputPlayer === null || inputPlayer.hp <= 0) continue;

        monster.setTargetPlayer(inputPlayer);
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

        for (const [userId, user] of this.users) {
          // 대상 찾아보기
          const calculatedDistance = monster.returnCalculateDistance(user.player);

          if (distance > calculatedDistance) {
            distance = calculatedDistance;
            inputId = userId;
            inputPlayer = user.player;
          }
        }

        if (inputPlayer !== null) {
          //타겟이 바뀌었을 때
          monster.setTargetPlayer(inputPlayer);
          monsterDiscoverPayload.push({
            monsterId: monsterId,
            targetId: monster.targetPlayer,
          });
        }
      }
    }

    const packet = [
      config.packetType.S_MONSTER_AWAKE_NOTIFICATION,
      {
        monsterTarget: monsterDiscoverPayload,
      },
    ];

    this.broadcast(packet);
  }

  //플레이어가 등록된 몬스터들만 위치 패킷을 전송하는 게 좋겠다.
  //플레이어 타겟이 정해져 있지 않다면 무조건 코어 쪽으로 이동시키도록 한다.
  //
  monsterMove() {
    for (const [monsterId, monster] of this.monsters) {
      if (monster.isBossMonster()) {
        //보스 몬스터의 행동
        monster.setPattern();
      } else {
        //일반 몬스터의 행동
      }
    }

    for (const [monsterId, waveMonster] of this.waveMonsters) {
      if (waveMonster.isBossMonster()) {
        waveMonster.setPattern(); //웨이브 속의 보스 몬스터의 패턴
      } else {
        //일반 웨이브 몬스터의 패턴
      }
    }
  }

  monsterTimeCheck() {
    const now = Date.now();
    const deltaTime = now - this.monsterLastUpdate;
    for (const [monsterId, monster] of this.monsters) {
      monster.CoolTimeCheck(deltaTime);
    }
  }

  getObjectById(objectId) {
    return this.objects.get(objectId);
    //여기까지 몬스터 영역
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

  monsterMoveUpdate() {
    const monsterPositionData = [];
    while (this.monsterMoveQueue.length > 0) {
      const monsterPosition = this.monsterMoveQueue.pop();
      monsterPositionData.push(...monsterPosition.monsterPositionData);
    }

    // payload 인코딩
    const packet = [
      config.packetType.S_MONSTER_MOVE_NOTIFICATION,
      {
        monsterPositionData,
      },
    ];

    // 룸 내 인원에게 브로드캐스트
    this.broadcast(packet);
  }

  /**************
   * CORE
   */

  getCore() {
    return this.core;
  }

  getCoreHp() {
    return this.core.getCoreHp();
  }

  createObjectData() {
    const objectData = [];
    const coreData = this.core.getCoreData();

    objectData.push(coreData);

    const itemBoxGrades = ['B', 'C', 'D'];

    itemBoxGrades.forEach((grade) => {
      let count = 0;
      switch (grade) {
        case 'B':
          //count = config.itemBox.maxNumberOfItemBoxB;
          count = 30;
          break;
        case 'C':
          // count = config.itemBox.maxNumberOfItemBoxC;
          count = 20;
          break;
        case 'D':
          // count = config.itemBox.maxNumberOfItemBoxD;
          count = 10;
          break;
        default:
          break;
      }
      for (let i = 0; i < count; i++) {
        const itemBox = this.createItemBox(grade);
        objectData.push(itemBox);
      }
    });

    for (let i = 0; i < MAX_NUMBER_OF_GRASS; i++) {
      const grass = this.createObject('grass');
      objectData.push(grass);
    }

    return objectData;
  }

  // 코어 박스 생성
  createCoreBox(coreData) {
    coreData.ObjectData.objectCode = 2; // objectCode 변경
    const itemBox = new ItemBox(coreData.ObjectData.objectId);
    this.objects.set(coreData.ObjectData.objectId, itemBox);
  }

  coreDamaged(damage) {
    const coreHp = this.core.coreDamaged(damage);
    if (coreHp <= 0) {
      // console.log('#################### 코어 터짐');
      gameSession.removeGame(this);
    }
    return coreHp;
  }

  /**************
   * WAVE
   */
  changePhase() {
    if (this.dayPhase === DayPhase.DAY) this.dayPhase = DayPhase.NIGHT;
    else this.dayPhase = DayPhase.DAY;

    const changePhasePacket = [
      config.packetType.S_GAME_PHASE_UPDATE_NOTIFICATION,
      {
        gameState: {
          phaseType: this.dayPhase,
          nextPhaseAt: this.lastUpdate + config.game.phaseCount[this.dayPhase],
        },
      },
    ];

    this.broadcast(changePhasePacket);
  }

  setWaveState(state) {
    this.waveState = state;
  }

  // 웨이브 몬스터 생성
  // 여기서는 데이터를 생성하지 않고 spawn을 통해 생성한다.
  addWaveMonster() {
    const monstersData = [];
    const { monster: monsterAsset } = getGameAssets();
    const waveMonsterSize = this.waveCount * 2 + 3;

    for (let i = 1; i <= waveMonsterSize; i++) {
      const monsterId = this.monsterIndex++;

      if (this.bossMonsterWaveCount === 0) {
        const data = monsterAsset.data[7];
        this.bossMonsterWaveCount = 20;

        monstersData.push({
          monsterId,
          monsterCode: data.code,
        });
      } else {
        if (this.waveCount === 1) {
          const monsterList = [0, 1];
          // 몬스터 데이터 뽑기
          const codeIdx = Math.floor(Math.random() * monsterList.length);
          const data = monsterAsset.data[monsterList[codeIdx]];

          // 몬스터 id와 code 저장
          monstersData.push({
            monsterId,
            monsterCode: data.code,
          });
        } else if (this.waveCount === 2) {
          const monsterList = [0, 1, 2, 3];
          // 몬스터 데이터 뽑기
          const codeIdx = Math.floor(Math.random() * monsterList.length);
          const data = monsterAsset.data[monsterList[codeIdx]];

          // 몬스터 id와 code 저장
          monstersData.push({
            monsterId,
            monsterCode: data.code,
          });
        } else {
          const monsterList = [0, 1, 2, 3, 4, 5, 6];
          // 몬스터 데이터 뽑기
          const codeIdx = Math.floor(Math.random() * monsterList.length);
          const data = monsterAsset.data[monsterList[codeIdx]];

          // 몬스터 id와 code 저장
          monstersData.push({
            monsterId,
            monsterCode: data.code,
          });
        }
      }
    }

    const waveMonsterSpawnRequestPacket = [
      config.packetType.S_MONSTER_SPAWN_REQUEST,
      {
        monsters: monstersData,
      },
    ];

    const owner = this.getUserById(this.ownerId);
    owner.sendPacket(waveMonsterSpawnRequestPacket);
    this.waveCount += 1;
  }

  //웨이브 몬스터 생성1
  spawnWaveMonster(monsters) {
    for (const monster of monsters) {
      // Monster Asset 조회
      const { monster: monsterAsset } = getGameAssets();
      const data = monsterAsset.data.find((asset) => asset.code === monster.monsterCode);
      // console.log(data);

      if (monster.monsterCode === 208) {
        const bossMonster = new BossMonster(
          monster.monsterId,
          monster.monsterCode,
          data.name,
          data.hp,
          data.attack,
          data.defence,
          data.range,
          data.speed,
          data.grade,
          monster.x,
          monster.y,
          true,
        );

        this.monsters.set(monster.monsterId, bossMonster);
        this.waveMonsters.set(monster.monsterId, bossMonster);
      } else {
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
          data.grade,
          monster.x,
          monster.y,
          true,
        );

        this.monsters.set(monster.monsterId, spawnMonster);
        this.waveMonsters.set(monster.monsterId, spawnMonster);
      }
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

      if (this.dayPhase === DayPhase.DAY) {
        //플레이어가 죽는 거 구현
        for (const [userId, user] of this.users) {
          if (user.player.getPlayerHp() > 0) {
            continue;
          }
          let dx;
          let dy;
          const revivalPart = Math.floor(Math.random() * 4 + 1);
          switch (revivalPart) {
            case 1:
              dx = -4 - Math.random() * 2 + this.corePosition.x;
              dy = 3 + Math.random() + this.corePosition.y;
              break;
            case 2:
              dx = -4 - Math.random() * 2 + this.corePosition.x;
              dy = -3 - Math.random() + this.corePosition.y;
              break;
            case 3:
              dx = 4 + Math.random() * 2 + this.corePosition.x;
              dy = -3 - Math.random() + this.corePosition.y;
              break;
            case 4:
              dx = 4 + Math.random() * 2 + this.corePosition.x;
              dy = 3 + Math.random() + this.corePosition.y;
              break;
          }

          user.player.revival(dx, dy);

          const revivalPayloadInfos = [
            config.packetType.S_PLAYER_REVIVAL_NOTIFICATION,
            {
              playerId: userId,
              position: {
                x: dx,
                y: dy,
              },
            },
          ];

          this.broadcast(revivalPayloadInfos);
        }
      }

      this.dayCounter = 0;
    }
  }

  // 아이템 박스 생성
  createItemBox(itemBoxGrade) {
    const { objectDropTable } = getGameAssets();
    const { name, objectCode } = objectDropTable.data.find((e) => e?.grade === itemBoxGrade);

    const boxId = this.itemManager.createObjectId();
    const itemBox = new ItemBox(boxId, objectCode, name, itemBoxGrade);
    // console.log(`created item box boxId${boxId}, name:${name}, objectCode${objectCode}`);

    // 랜덤 아이템 생성 및 박스에 추가
    const items = this.itemManager.generateRandomItems(itemBoxGrade);
    const isRnwhanf = Math.random() <= 0.3;

    if (isRnwhanf) {
      items.push(
        new Item({
          itemData: {
            itemCode: 901,
            count: 1,
          },
          position: null,
        }),
      );
    }

    items.forEach((item, index) => {
      itemBox.itemList.splice(index, 1, {
        itemCode: item.itemData.itemCode,
        count: item.itemData.count,
      });
    });

    const data = {
      ObjectData: { objectId: itemBox.id, objectCode: itemBox.objectCode },
      itemData: itemBox.itemList,
      x: itemBox.x,
      y: itemBox.y,
    };

    this.objects.set(itemBox.id, itemBox);

    return data;
  }

  // 초기 아이템 생성 - 테스트
  createObject(name, objectCode = null, x = null, y = null) {
    switch (name) {
      case 'grass': {
        const id = this.itemManager.createObjectId();
        const grass = new Grass(id);
        const data = {
          ObjectData: { objectId: grass.id, objectCode: grass.objectCode },
          itemData: grass.dropItems,
          x: grass.x,
          y: grass.y,
        };
        this.objects.set(id, grass);
        return data;
      }
      case 'wall': {
        const id = this.itemManager.createObjectId();
        const wall = new Wall(id, objectCode, x, y);
        const data = {
          ObjectData: { objectId: id, objectCode },
          position: { x, y },
        };
        this.objects.set(id, wall);
        return data;
      }
      default:
        break;
    }
  }
  // 초기 아이템 생성 - 테스트
  createInitialItems() {
    // 1번과 101번 아이템 고정으로 생성
    return [
      {
        itemCode: 1,
        count: 1,
      },
      {
        itemCode: 101,
        count: 1,
      },
    ];
  }

  setRevivalList(playerId) {
    this.revivalList.push(playerId);
  }
}

export default Game;
