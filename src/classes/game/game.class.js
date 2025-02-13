import makePacket from '../../utils/packet/makePacket.js';
import { getGameAssets } from '../../init/assets.js';
import Monster from './monster.class.js';
import Player from './player.class.js';
import { config } from '../../config/config.js';
import { PACKET_TYPE } from '../../config/constants/header.js';

class Game {
  constructor() {
    this.players = new Map();
    this.monsterIndex = 1;
    this.monsters = new Map();
    this.map = []; //0과 1로 된 2차원배열?
    this.coreHp = config.game.core.maxHP;
    this.corePosition = config.game.core.position;
    this.lastUpdate = 0;
    this.gameLoop = null;
    this.highLatency = 120;//플레이어들 가운데 제일 높은 레이턴시 값을 이걸로 하자. 플레이어 작업 하시는 분이 나중에 레이턴시 관리 해주시길.
    this.waveStamp = 60000;
  }

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
      const codeIdx = Math.floor(Math.random() * monsterAsset.data.length);
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
    // 생성 제한 처리
    if (this.monsters.size >= config.game.monster.maxSpawnCount) {
      return;
    }

    // TODO : 한번에 생성할지 프레임단위로 단일 생성할지 성능보고?
    // maxAmount 만큼 몬스터 생성
    const maxAmount = config.game.monster.maxSpawnCount - this.monsters.size;

    for (let i = 1; i <= maxAmount; i++) {
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

  getMonsterById(monsterId) {
    return this.monsters.get(monsterId);
  }

  getAllMonster() {
    return this.monsters;
  }

  removeMonster(monsterId) {
    this.monsters.delete(monsterId);
  }

  removeAllMonster() {
    this.monsters.clear();
  }

  //다른 사람에게 전송(본인 제외)
  notification(socket, packet) {
    this.players.forEach((player) => {
      if (player.getUser().getSocket() !== socket) {
        player.getUser().getSocket().write(packet);
      }
    });
  }

  broadcast(packet) {
    this.players.forEach((player) => {
      player.getUser().getSocket().write(packet);
    })
  }

  gameLoopStart() {
    if (this.gameLoop !== null) {
      return;
    }
    this.gameLoop = setInterval(() => {
      this.waveCheck();
      //this.addMonster();
      this.monsterUpdate();
      //this.userUpdate();
      //밑의 것을 전부 monster들이 알아서 처리할 수 있도록 한다.


    }, 1000);
  }

  waveCheck() {
    const now = Date.now();
    const delta = now - this.lastUpdate;
    this.waveStamp -= delta;
    this.lastUpdate = now;

    if (this.waveStamp <= 0) {
      this.waveStamp = 60000;
      //여기서 웨이브 처리를 해주도록 한다.
    }
  }


  userUpdate() {
    for (const player of this.players) {
      //console.log(player.x, player.y);
    }
  }

  monsterAttackCheck(monsterId) {
    const monsterIndex = this.monsters[monsterId];

  }

  monsterUpdate() {
    //몬스터가 플레이어의 거리를 구해서 발견한다.
    this.monsterDisCovered();
    //몬스터가 플레이어를 가지고 있을 경우 움직인다.
    //this.monsterMove(this.highLatency);
    //몬스터가 플레이어를 잃는 과정
    //this.monsterLostPlayerCheck();
  }

  monsterDisCovered() {
    for (const [key, monster] of this.monsters) {
      if (!monster.hasPriorityPlayer()) {
        for (const player of this.players) {
          monster.setTargetPlayer(player);
          if (monster.hasPriorityPlayer()) {
            console.log("플레이어가 등록됨");
            const monsterDiscoverPayload = {
              monsterId: monster.id,
              targetId: player.id
            }

            const packet = makePacket(PACKET_TYPE.S_MONSTER_AWAKE_NOTIFICATION, monsterDiscoverPayload);
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
          timestamp: deltaTime
        };
        //위치로 이동시키는 개념이라 전체 브로드캐스팅을 해도 문제는 없어 보임.
        const packet = makePacket(PACKET_TYPE.S_MONSTER_MOVE_NOTIFICATION, monsterMovePayload);
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
  }
}

export default Game;