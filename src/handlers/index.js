import { config } from '../config/config.js';
import attackPlayerHandler from './player/attackPlayer.handler.js';
import createRoomHandler from './room/createRoom.handler.js';
import getRoomListHandler from './room/getRoomList.handler.js';
import joinRoomHandler from './room/joinRoom.handler.js';
import leaveRoomHandler from './room/leaveRoom.handler.js';
import signInHandler from './user/signIn.handler.js';
import signUpHandler from './user/signUp.handler.js';
import gameStartHandler from './game/startGame.handler.js';
import gamePrepareReqHandler from './game/gamePrepareReq.handler.js';
import updateLocationHandler from './player/updateLoaction.handler.js';
import attackPlayerMonsterHandler from './player/attackPlayerMonster.handler.js';
import waveStartHandler from './game/waveStart.handler.js';
import AttackByPlayerHandler from './monster/attackByPlayer.handler.js';
import damagedByPlayerHandler from './monster/damagedByPlayer.handler.js';
import monsterMoveNotificationHandler from './monster/moveNotification.handler.js';
import weaponPlayerHandler from './player/weaponPlayer.handler.js';

const handlers = {
  [config.packetType.REGISTER_REQUEST[0]]: signUpHandler,
  [config.packetType.LOGIN_REQUEST[0]]: signInHandler,
  [config.packetType.C_PLAYER_ATTACK_REQUEST[0]]: attackPlayerHandler,
  [config.packetType.CREATE_ROOM_REQUEST[0]]: createRoomHandler,
  [config.packetType.GET_ROOM_LIST_REQUEST[0]]: getRoomListHandler,
  [config.packetType.JOIN_ROOM_REQUEST[0]]: joinRoomHandler,
  [config.packetType.LEAVE_ROOM_REQUEST[0]]: leaveRoomHandler,
  [config.packetType.START_GAME_REQUEST[0]]: gameStartHandler,
  [config.packetType.C_PLAYER_POSITION_UPDATE_REQUEST[0]]: updateLocationHandler,
  [config.packetType.PREPARE_GAME_REQUEST[0]]: gamePrepareReqHandler,
  [config.packetType.C_PLAYER_ATTACK_MONSTER_REQUEST[0]]: attackPlayerMonsterHandler,
  [config.packetType.C_MONSTER_SPAWN_RESPONSE[0]]: waveStartHandler,
  [config.packetType.C_MONSTER_ATTACK_REQUEST[0]]: AttackByPlayerHandler,
  [config.packetType.S_MONSTER_HP_UPDATE_NOTIFICATION[0]]: damagedByPlayerHandler,
  [config.packetType.C_MONSTER_MOVE_REQUEST[0]]: monsterMoveNotificationHandler,
  [config.packetType.C_PLAYER_USE_ITEM_REQUEST[0]]: weaponPlayerHandler,
};

export default handlers;
