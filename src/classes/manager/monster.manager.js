import Monster from '../monster/monster.class.js';
import { getGameAssets, loadGameAssets } from '../../init/assets.js';
import { MAX_VALUE_X, MIN_VALUE_X, MAX_VALUE_Y, MIN_VALUE_Y } from '../../constants/map.js';
import { MAX_SPAWN_COUNT } from '../../constants/monster.js';

class MonsterManager {
  constructor() {
    this.currentIndex = 1;
    this.monsters = new Map();
  }

  async addMonster() {
    // 생성 제한 처리
    if (this.monsters.size >= MAX_SPAWN_COUNT) {
      return;
    }

    // TODO : 한번에 생성할지 프레임단위로 단일 생성할지 성능보고?
    // maxLeng 만큼 몬스터 생성
    const maxLeng = MAX_SPAWN_COUNT - this.monsters.size;

    for (let i = 1; i <= maxLeng; i++) {
      const id = this.currentIndex;
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
        id,
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

      this.monsters.set(id, monster);
      this.currentIndex++; //Index 증가

      // Broadcast
      const payload = {
        monsterId: id,
        code: monster.monsterCode,
        x,
        y,
      };

      // TODO: 수정예정
      // const packet = createResponse(payload);
      // game.broadcast(paketType, packet);
    }
    return this.monsters;
  }

  // 몬스터 개체 삭제
  removeMonster(id) {
    return this.monsters.delete(id);
  }

  // 몬스터 전체 삭제
  removeAllMonster() {
    return this.monsters.clear();
  }

  // 단일 몬스터 조회
  getMonsterById(id) {
    return this.monsters.get(id);
  }

  // 전체 몬스터 조회
  getAllMonster() {
    return this.monsters;
  }

  // 랜덤 좌표 값 생성
  createRandomPositionValue(maxvalue) {
    let isPositiveNum = Math.floor(Math.random() * 2); // 0 : 음수 1: 양수
    let randomNumber = Math.random() * maxvalue;
    return isPositiveNum === 1 ? randomNumber : randomNumber * -1;
  }
}

export default MonsterManager;
