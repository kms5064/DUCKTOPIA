export const PACKET_TYPE_BYTE = 2;
export const VERSION_LENGTH_BYTE = 1;
export const PAYLOAD_LENGTH_BYTE = 4;

export const PACKET_TYPE = {
  // 유저 회원가입,로그인
  REGISTER_REQUEST: [1001, 'registerRequest'],
  REGISTER_RESPONSE: [1002, 'registerResponse'],
  LOGIN_REQUEST: [1003, 'loginRequest'],
  LOGIN_RESPONSE: [1004, 'loginResponse'],

  // 방 생성,참가
  CREATE_ROOM_REQUEST: [2001, 'createRoomRequest'],
  CREATE_ROOM_RESPONSE: [2002, 'createRoomResponse'],
  JOIN_ROOM_REQUEST: [2003, 'joinRoomRequest'],
  JOIN_ROOM_RESPONSE: [2004, 'joinRoomResponse'],
  JOIN_ROOM_NOTIFICATION: [2005, 'joinRoomNotification'],
  GET_ROOM_LIST_REQUEST: [2006, 'getRoomListRequest'],
  GET_ROOM_LIST_RESPONSE: [2007, 'getRoomListResponse'],
  LEAVE_ROOM_REQUEST: [2008, 'leaveRoomRequest'],
  LEAVE_ROOM_RESPONSE: [2009, 'leaveRoomResponse'],
  LEAVE_ROOM_NOTIFICATION: [2010, 'leaveRoomNotification'],

  // 게임 시작
  PREPARE_GAME_REQUEST: [3001, 'gamePrepareRequest'],
  PREPARE_GAME_RESPONSE: [3002, 'gamePrepareResponse'],
  PREPARE_GAME_NOTIFICATION: [3003, 'gamePrepareNotification'],
  START_GAME_REQUEST: [3004, 'gameStartRequest'],
  START_GAME_RESPONSE: [3005, 'gameStartResponse'],
  START_GAME_NOTIFICATION: [3006, 'gameStartNotification'],

  // 에러
  S_ERROR_NOTIFICATION: [7001, 'errorNotification'],
};
