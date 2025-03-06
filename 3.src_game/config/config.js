import {
  CLIENT_VERSION,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
  HOST,
  PORT,
  LOCATION_REQ_TIME_TERM,
  REDIS_USER,
  REDIS_PASSWORD,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_CUSTOM,
} from './constants/env.js';
import {
  PACKET_TYPE,
  PACKET_TYPE_BYTE,
  PAYLOAD_LENGTH_BYTE,
  VERSION_LENGTH_BYTE,
  USER_ID_LENGTH_BYTE,
} from './constants/header.js';
import { CORE_MAX_HP, CORE_POSITION } from './constants/core.js';
import {
  PLAYER_MAX_HUNGER,
  ATK_PER_LV,
  PLAYER_DEFAULT_ANGLE,
  PLAYER_DEFAULT_RANGE,
  PLAYER_MAX_HP,
  PLAYER_SPEED,
  VALID_DISTANCE,
  PLAYER_HUNGER_PERIOD,
  PLAYER_HUNGER_DECREASE_AMOUNT,
  PLAYER_HP_DECREASE_AMOUNT_BY_HUNGER,
} from './constants/player.js';
import {
  MAX_DROP_ITEM_COUNT,
  MAX_SPAWN_COUNT,
  NORMAL_MONSTER_MAX_CODE,
  WAVE_MAX_MONSTER_COUNT,
  WAVE_MONSTER_MAX_CODE,
  WAVE_MONSTER_MIN_CODE,
} from './constants/monster.js';
import {
  CENTER_X,
  CENTER_Y,
  MAX_VALUE_X,
  MAX_VALUE_Y,
  MIN_VALUE_X,
  MIN_VALUE_Y,
} from './constants/map.js';
import { CharacterType } from './constants/character.js';
import {
  VALID_DISTANCE_OF_BOX,
  BOX_MAX_SLOTS,
  ITEM_MIN_COUNT,
  ITEM_MAX_STACK,
  OBJECT_CORE_CODE,
} from './constants/objects.js';
import {
  EQUIPMENT_GRADES,
  ITEM_PICKUP_RANGE,
  MUSTARD_ITEM_CODE,
  MUSTARD_MATERIAL_CODE1,
  MUSTARD_MATERIAL_CODE2,
  MUSTARD_MATERIAL_CODE3,
} from './constants/item.js';

import { DAY_TIME, NIGHT_TIME, DayPhase } from './constants/game.js';

export const config = {
  header: {
    packetTypeByte: PACKET_TYPE_BYTE,
    versionLengthByte: VERSION_LENGTH_BYTE,
    payloadLengthByte: PAYLOAD_LENGTH_BYTE,
    userIdLengthByte: USER_ID_LENGTH_BYTE,
  },
  packetType: {
    ...PACKET_TYPE,
  },
  server: {
    host: HOST,
    port: PORT,
  },
  client: {
    version: CLIENT_VERSION,
    locationReqTimeTerm: LOCATION_REQ_TIME_TERM,
  },
  databases: {
    USER_DB: {
      name: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: DB_PORT,
    },
  },
  redis: {
    user: REDIS_USER,
    password: REDIS_PASSWORD,
    host: REDIS_HOST,
    port: REDIS_PORT,
    custom: REDIS_CUSTOM + '/',
  },
  game: {
    phaseCount: {
      [DayPhase.DAY]: DAY_TIME,
      [DayPhase.NIGHT]: NIGHT_TIME,
    },
    core: {
      maxHP: CORE_MAX_HP,
      position: CORE_POSITION,
    },
    player: {
      atkPerLv: ATK_PER_LV,
      playerMaxHunger: PLAYER_MAX_HUNGER,
      playerDefaultRange: PLAYER_DEFAULT_RANGE,
      playerDefaultAngle: PLAYER_DEFAULT_ANGLE,
      playerMaxHealth: PLAYER_MAX_HP,
      playerSpeed: PLAYER_SPEED,
      validDistance: VALID_DISTANCE,
      playerHungerPeriod: PLAYER_HUNGER_PERIOD,
      playerHungerDecreaseAmount: PLAYER_HUNGER_DECREASE_AMOUNT,
      playerHpDecreaseAmountByHunger: PLAYER_HP_DECREASE_AMOUNT_BY_HUNGER,
    },
    characterType: {
      ...CharacterType,
    },
    monster: {
      maxItemDropCount: MAX_DROP_ITEM_COUNT,
      maxSpawnCount: MAX_SPAWN_COUNT,
      normalMonsterMaxCode: NORMAL_MONSTER_MAX_CODE,
      waveMaxMonsterCount: WAVE_MAX_MONSTER_COUNT,
      waveMonsterMinCode: WAVE_MONSTER_MIN_CODE,
      waveMonsterMaxCode: WAVE_MONSTER_MAX_CODE,
    },
    map: {
      startX: MIN_VALUE_X,
      startY: MIN_VALUE_Y,
      endX: MAX_VALUE_X,
      endY: MAX_VALUE_Y,
    },
    itemBox: {
      validDistance: VALID_DISTANCE_OF_BOX,
      centerX: CENTER_X,
      centerY: CENTER_Y,
      boxMaxSlots: BOX_MAX_SLOTS,
      itemMinCount: ITEM_MIN_COUNT,
      itemMaxStack: ITEM_MAX_STACK,
      objectCoreCode: OBJECT_CORE_CODE,
    },
    item: {
      pickupRange: ITEM_PICKUP_RANGE,
      mustardMaterialCode1: MUSTARD_MATERIAL_CODE1,
      mustardMaterialCode2: MUSTARD_MATERIAL_CODE2,
      mustardMaterialCode3: MUSTARD_MATERIAL_CODE3,
      mustardItemCode: MUSTARD_ITEM_CODE,
      equipmentGrades: EQUIPMENT_GRADES,
    },
  },
};
