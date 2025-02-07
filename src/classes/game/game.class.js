import makePacket from '../../utils/packet/makePacket.js';
import { MAX_VALUE_X, MAX_VALUE_Y, MIN_VALUE_X, MIN_VALUE_Y } from '../../constants/map.js';
import { MAX_SPAWN_COUNT } from '../../constants/monster.js';
import { getGameAssets } from '../../init/assets.js';
import Monster from '../monster/monster.class.js';
import { PACKET_TYPE } from '../../config/constants/header.js';

class Game {
  constructor(uuid) {
    this.id = uuid;
    this.players = [];
    this.monsterIndex = 1;
    this.monsters = new Map();
    this.map = []; //0과 1로 된 2차원배열?
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

  addMonster() {
    // 생성 제한 처리
    if (this.monsters.size >= MAX_SPAWN_COUNT) {
      return;
    }

    // TODO : 한번에 생성할지 프레임단위로 단일 생성할지 성능보고?
    // maxLeng 만큼 몬스터 생성
    const maxLeng = MAX_SPAWN_COUNT - this.monsters.size;

    for (let i = 1; i <= maxLeng; i++) {
      const monsterId = this.monsterIndex;
      // Monster Asset 조회
      const { monster: monsterAsset } = getGameAssets();
      // 몬스터 데이터 뽑기
      const codeIdx = Math.floor(Math.random() * monsterAsset.data.length);
      const data = monsterAsset.data[codeIdx];

      // 좌표 생성
      let x = this.createRandomPositionValue(MAX_VALUE_X);
      let y = this.createRandomPositionValue(MAX_VALUE_Y);

      // 좌표 최소 값 조정
      if (x < MIN_VALUE_X) x = MIN_VALUE_X;
      if (y < MIN_VALUE_Y) y = MIN_VALUE_Y;
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

  getMonster(monsterId) {
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

  // 랜덤 좌표 값 생성
  createRandomPositionValue(maxvalue) {
    let isPositiveNum = Math.floor(Math.random() * 2); // 0 : 음수 1: 양수
    let randomNumber = Math.random() * maxvalue;
    return isPositiveNum === 1 ? randomNumber : randomNumber * -1;
  }

  addMap(map) {
    this.map = map;
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
}

export default Game;
