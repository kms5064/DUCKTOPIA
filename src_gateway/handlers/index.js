import { config } from '../config/config.js';
import signInHandler from './user/signIn.handler.js';
import signUpHandler from './user/signUp.handler.js';
import onLobbyServerHandler from './server/onLobbyServer.handler.js';
import onGameServerHandler from './server/onGameServer.handler.js';

const handlers = {
  [config.packetType.REGISTER_REQUEST[0]]: signUpHandler,
  [config.packetType.LOGIN_REQUEST[0]]: signInHandler,
  [config.packetType.C_PLAYER_ATTACK_REQUEST[0]]: onLobbyServerHandler,
  [config.packetType.CREATE_ROOM_REQUEST[0]]: onLobbyServerHandler,
  [config.packetType.GET_ROOM_LIST_REQUEST[0]]: onLobbyServerHandler,
  [config.packetType.JOIN_ROOM_REQUEST[0]]: onLobbyServerHandler,
  [config.packetType.LEAVE_ROOM_REQUEST[0]]: onLobbyServerHandler,
  [config.packetType.PREPARE_GAME_REQUEST[0]]: onLobbyServerHandler,
  [config.packetType.START_GAME_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_PLAYER_POSITION_UPDATE_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_PLAYER_ATTACK_MONSTER_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_MONSTER_SPAWN_RESPONSE[0]]: onGameServerHandler,
  [config.packetType.C_MONSTER_ATTACK_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_MONSTER_MOVE_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_PLAYER_USE_ITEM_REQUEST[0]]: onGameServerHandler,
  [config.packetType.S_PLAYER_DAMAGED_BY_MONSTER[0]]: onGameServerHandler,
};

export default handlers;
