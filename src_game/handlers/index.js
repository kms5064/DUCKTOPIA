import { config } from '../config/config.js';
import attackPlayerHandler from './player/attackPlayer.handler.js';
import gameStartHandler from './game/startGame.handler.js';
import gamePrepareReqHandler from './game/gamePrepareReq.handler.js';
import updateLocationHandler from './player/updateLocation.handler.js';
import attackPlayerMonsterHandler from './player/attackPlayerMonster.handler.js';
import waveStartHandler from './game/waveStart.handler.js';
import AttackByPlayerHandler from './monster/attackByPlayer.handler.js';
import monsterMoveNotificationHandler from './monster/moveNotification.handler.js';
import weaponPlayerHandler from './player/weaponPlayer.handler.js';
import playerDamagedByMonsterHandler from './monster/playerDamagedByMonster.js';

const handlers = {
  [config.packetType.C_PLAYER_ATTACK_REQUEST[0]]: attackPlayerHandler,
  [config.packetType.START_GAME_REQUEST[0]]: gameStartHandler,
  [config.packetType.C_PLAYER_POSITION_UPDATE_REQUEST[0]]: updateLocationHandler,
  [config.packetType.PREPARE_GAME_REQUEST[0]]: gamePrepareReqHandler,
  [config.packetType.C_PLAYER_ATTACK_MONSTER_REQUEST[0]]: attackPlayerMonsterHandler,
  [config.packetType.C_MONSTER_SPAWN_RESPONSE[0]]: waveStartHandler,
  [config.packetType.C_MONSTER_ATTACK_REQUEST[0]]: AttackByPlayerHandler,
  [config.packetType.C_MONSTER_MOVE_REQUEST[0]]: monsterMoveNotificationHandler,
  [config.packetType.C_PLAYER_USE_ITEM_REQUEST[0]]: weaponPlayerHandler,
  [config.packetType.S_PLAYER_DAMAGED_BY_MONSTER[0]]: playerDamagedByMonsterHandler,
};

export default handlers;
