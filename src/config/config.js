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
} from './constants/env.js';
import {
  PACKET_TYPE,
  PACKET_TYPE_BYTE,
  PAYLOAD_LENGTH_BYTE,
  VERSION_LENGTH_BYTE,
} from './constants/header.js';
import { CORE_MAX_HP, CORE_POSITION } from './constants/core.js';
import { PLAYER_MAX_HUNGER, ATK_PER_LV, PLAYER_DEFAULT_ANGLE, PLAYER_DEFAULT_RANGE, PLAYER_MAX_HP, PLAYER_SPEED, VALID_DISTANCE } from './constants/player.js';
import { MAX_DROP_ITEM_COUNT, MAX_SPAWN_COUNT } from './constants/monster.js';
import { MAX_VALUE_X, MAX_VALUE_Y, MIN_VALUE_X, MIN_VALUE_Y } from './constants/map.js';

export const config = {
  header: {
    packetTypeByte: PACKET_TYPE_BYTE,
    versionLengthByte: VERSION_LENGTH_BYTE,
    payloadLengthByte: PAYLOAD_LENGTH_BYTE,
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
  game : {
    core: {
      maxHP: CORE_MAX_HP,
      position: CORE_POSITION,
    },
    player:{
      atkPerLv: ATK_PER_LV,
      playerMaxHunger: PLAYER_MAX_HUNGER,
      playerDefaultRange: PLAYER_DEFAULT_RANGE,
      playerDefaultAngle: PLAYER_DEFAULT_ANGLE,
      playerMaxHealth: PLAYER_MAX_HP,
      playerSpeed: PLAYER_SPEED,
      validDistance: VALID_DISTANCE,
    },
    monster:{
      maxItemDropCount: MAX_DROP_ITEM_COUNT,
      maxSpawnCount: MAX_SPAWN_COUNT,
    },
    map: {
      startX: MIN_VALUE_X,
      startY: MIN_VALUE_Y,
      endX: MAX_VALUE_X,
      endY: MAX_VALUE_Y,
    }
  }
};
