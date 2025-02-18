import { config } from '../config/config.js';

const handlers = {
  [config.packetType.REGISTER_REQUEST[0]]: config.server.lobbyServer,
  [config.packetType.LOGIN_REQUEST[0]]: config.server.lobbyServer,
  [config.packetType.C_PLAYER_ATTACK_REQUEST[0]]: config.server.lobbyServer,
  [config.packetType.CREATE_ROOM_REQUEST[0]]: config.server.lobbyServer,
  [config.packetType.GET_ROOM_LIST_REQUEST[0]]: config.server.lobbyServer,
  [config.packetType.JOIN_ROOM_REQUEST[0]]: config.server.lobbyServer,
  [config.packetType.LEAVE_ROOM_REQUEST[0]]: config.server.lobbyServer,
  [config.packetType.PREPARE_GAME_REQUEST[0]]: config.server.lobbyServer,
  [config.packetType.START_GAME_REQUEST[0]]: config.server.gameServer,
  [config.packetType.C_PLAYER_POSITION_UPDATE_REQUEST[0]]: config.server.gameServer,
  [config.packetType.C_PLAYER_ATTACK_MONSTER_REQUEST[0]]: config.server.gameServer,
  [config.packetType.C_MONSTER_SPAWN_RESPONSE[0]]: config.server.gameServer,
  [config.packetType.C_MONSTER_ATTACK_REQUEST[0]]: config.server.gameServer,
  [config.packetType.C_MONSTER_MOVE_REQUEST[0]]: config.server.gameServer,
  [config.packetType.C_PLAYER_USE_ITEM_REQUEST[0]]: config.server.gameServer,
  [config.packetType.S_PLAYER_DAMAGED_BY_MONSTER[0]]: config.server.gameServer,
};

export default handlers;
