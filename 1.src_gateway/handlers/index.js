import { config } from '../config/config.js';
import signInHandler from './user/signIn.handler.js';
import signUpHandler from './user/signUp.handler.js';
import onLobbyServerHandler from './server/onLobbyServer.handler.js';
import onGameServerHandler from './server/onGameServer.handler.js';
import latencyCheckHandler from './server/latencyCheck.handler.js';
import detachmentItemHandler from '../../3.src_game/handlers/player/detachmentItem.handler.js';
import dropItemHandler from '../../3.src_game/handlers/player/dropItem.handler.js';

const handlers = {
  // Gateway
  [config.packetType.REGISTER_REQUEST[0]]: signUpHandler,
  [config.packetType.LOGIN_REQUEST[0]]: signInHandler,
  [config.packetType.S_ERROR_NOTIFICATION[0]]: latencyCheckHandler,

  // Lobby
  [config.packetType.GET_ROOM_LIST_REQUEST[0]]: onLobbyServerHandler,
  [config.packetType.CREATE_ROOM_REQUEST[0]]: onLobbyServerHandler,
  [config.packetType.JOIN_ROOM_REQUEST[0]]: onLobbyServerHandler,
  [config.packetType.LEAVE_ROOM_REQUEST[0]]: onLobbyServerHandler,
  [config.packetType.PREPARE_GAME_REQUEST[0]]: onLobbyServerHandler,

  // Game
  [config.packetType.JOIN_SERVER_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_PLAYER_ATTACK_REQUEST[0]]: onGameServerHandler,
  [config.packetType.START_GAME_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_PLAYER_POSITION_UPDATE_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_PLAYER_ATTACK_MONSTER_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_MONSTER_SPAWN_RESPONSE[0]]: onGameServerHandler,
  [config.packetType.C_MONSTER_ATTACK_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_MONSTER_MOVE_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_PLAYER_USE_ITEM_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_PLAYER_OPEN_BOX_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_PLAYER_TAKE_OUT_AN_ITEM_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_PLAYER_PUT_AN_ITEM_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_PLAYER_CLOSE_BOX_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_PLAYER_DAMAGED_BY_MONSTER_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_OBJECT_DAMAGED_BY_MONSTER_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_PLAYER_GET_ITEM_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_PLAYER_SET_OBJECT_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_OBJECT_DAMAGED_BY_PLAYER_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_ITEM_COMBINATION_REQUEST[0]]: onGameServerHandler,
  [config.packetType.S_PLAYER_CHATTING_REQUEST[0]]: onGameServerHandler,
  [config.packetType.C_ITEM_DETACHMENT_REQUEST[0]]:detachmentItemHandler,
  [config.packetType.C_DROP_ITEM_REQUEST[0]]: dropItemHandler,


};

export default handlers;
