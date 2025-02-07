import { config } from '../config/config.js';
import gameStartHandler from './game/realStartGame.handler.js';
import gamePrepareReqHandler from './game/startGame.handler.js';
import attackPlayerHandler from './player/attackPlayer.handler.js';
import movePlayerHandler from './player/move.Player.handler.js';
import createRoomHandler from './room/createRoom.handler.js';
import getRoomListHandler from './room/getRoomList.handler.js';
import joinRoomHandler from './room/JoinRoom.handler.js'
import signInHandler from './user/signIn.handler.js';
import signUpHandler from './user/signUp.handler.js';


const handlers = {
  [config.packetType.REGISTER_REQUEST[0]]: signUpHandler,
  [config.packetType.LOGIN_REQUEST[0]]: signInHandler,
  [config.packetType.PLAYER_ATTACK_REQUEST[0]]: attackPlayerHandler,
  [config.packetType.CREATE_ROOM_REQUEST[0]]: createRoomHandler,
  [config.packetType.GET_ROOM_LIST_REQUEST[0]]: getRoomListHandler,
  [config.packetType.JOIN_ROOM_REQUEST[0]]: joinRoomHandler,
  [config.packetType.PREPARE_GAME_REQUEST[0]]: gamePrepareReqHandler,
  [config.packetType.START_GAME_REQUEST[0]]: gameStartHandler,
  [config.packetType.PLAYER_UPDATE_POSITION_REQUEST[0]]: movePlayerHandler,
};

export default handlers;
