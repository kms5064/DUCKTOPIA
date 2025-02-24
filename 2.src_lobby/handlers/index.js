import { config } from '../config/config.js';
import createRoomHandler from './room/createRoom.handler.js';
import getRoomListHandler from './room/getRoomList.handler.js';
import joinRoomHandler from './room/joinRoom.handler.js';
import leaveRoomHandler from './room/leaveRoom.handler.js';
import loginCastHandler from './user/loginCast.handler.js';
import gamePrepareReqHandler from './game/gamePrepareReq.handler.js';
import deleteRoomHandler from './game/deleteRoom.handler.js';

const handlers = {
  [config.packetType.LOGIN_CAST[0]]: loginCastHandler,
  [config.packetType.CREATE_ROOM_REQUEST[0]]: createRoomHandler,
  [config.packetType.GET_ROOM_LIST_REQUEST[0]]: getRoomListHandler,
  [config.packetType.JOIN_ROOM_REQUEST[0]]: joinRoomHandler,
  [config.packetType.LEAVE_ROOM_REQUEST[0]]: leaveRoomHandler,
  [config.packetType.PREPARE_GAME_REQUEST[0]]: gamePrepareReqHandler,
  [config.packetType.S_GAME_OVER_NOTIFICATION[0]]: deleteRoomHandler,
};

export default handlers;
