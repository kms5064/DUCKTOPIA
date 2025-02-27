import { config } from '../config/config.js';
import attackPlayerHandler from './player/attackPlayer.handler.js';
import startGameHandler from './game/startGame.handler.js';
import updateLocationHandler from './player/updateLocation.handler.js';
import attackPlayerMonsterHandler from './player/attackPlayerMonster.handler.js';
import waveStartHandler from './game/waveStart.handler.js';
import monsterMoveNotificationHandler from './monster/monsterMoveNotification.handler.js';
import playerDamagedByMonsterHandler from './player/playerDamagedByMonster.js';
import playerOpenBoxHandler from './item/openBox.handler.js';
import playerTakeOutAnItemHandler from './item/takeOutAnItem.handler.js';
import playerPutAnItemHandler from './item/putAnItem.handler.js';
import playerCloseBoxHandler from './item/closeBox.handler.js';
import objectDamagedByMonsterHandler from './object/objectDamagedByMonster.handler.js';
import createGameHandler from './game/createGame.handler.js';
import latencyCheckHandler from './server/latencyCheck.handler.js';
import MonsterAttackHandler from './monster/monsterAttack.handler.js';
import getItemHandler from './item/getItem.handler.js';
import useItemHandler from './player/userItem.handler.js';

const handlers = {
  // Server
  [config.packetType.JOIN_SERVER_REQUEST[0]]: createGameHandler,
  [config.packetType.START_GAME_REQUEST[0]]: startGameHandler,
  [config.packetType.S_ERROR_NOTIFICATION[0]]: latencyCheckHandler,

  // Game
  [config.packetType.C_PLAYER_ATTACK_REQUEST[0]]: attackPlayerHandler,
  [config.packetType.C_PLAYER_ATTACK_MONSTER_REQUEST[0]]: attackPlayerMonsterHandler,
  [config.packetType.C_PLAYER_DAMAGED_BY_MONSTER_REQUEST[0]]: playerDamagedByMonsterHandler,
  [config.packetType.C_PLAYER_POSITION_UPDATE_REQUEST[0]]: updateLocationHandler,

  [config.packetType.C_PLAYER_USE_ITEM_REQUEST[0]]: useItemHandler,
  [config.packetType.C_PLAYER_TAKE_OUT_AN_ITEM_REQUEST[0]]: playerTakeOutAnItemHandler,
  [config.packetType.C_PLAYER_PUT_AN_ITEM_REQUEST[0]]: playerPutAnItemHandler,
  [config.packetType.C_PLAYER_GET_ITEM_REQUEST[0]]: getItemHandler,

  [config.packetType.C_PLAYER_OPEN_BOX_REQUEST[0]]: playerOpenBoxHandler,
  [config.packetType.C_PLAYER_CLOSE_BOX_REQUEST[0]]: playerCloseBoxHandler,
  [config.packetType.C_OBJECT_DAMAGED_BY_MONSTER_REQUEST[0]]: objectDamagedByMonsterHandler,

  [config.packetType.C_MONSTER_SPAWN_RESPONSE[0]]: waveStartHandler,
  [config.packetType.C_MONSTER_ATTACK_REQUEST[0]]: MonsterAttackHandler,
  [config.packetType.C_MONSTER_MOVE_REQUEST[0]]: monsterMoveNotificationHandler,
};

export default handlers;
