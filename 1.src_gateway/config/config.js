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
  USER_ID_LENGTH_BYTE,
  VERSION_LENGTH_BYTE,
} from './constants/header.js';
import { LOBBY_SERVER, GAME_SERVER } from './constants/server.js';

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
    lobbyServer: LOBBY_SERVER,
    gameServer: GAME_SERVER,
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
};
