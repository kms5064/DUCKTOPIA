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
  GET_ROOM_LIST_REQUEST: [2005, 'getRoomListRequest'],
  GET_ROOM_LIST_RESPONSE: [2006, 'getRoomListResponse'],

  // 게임 시작
  PREPARE_GAME_REQUEST: [3001, 'gamePrepareRequest'],
  PREPARE_GAME_RESPONSE: [3002, 'gamePrepareResponse'],
  PREPARE_GAME_NOTIFICATION: [3003, 'gamePrepareNotification'],
  START_GAME_REQUEST: [3004, 'gameStartRequest'],
  START_GAME_RESPONSE: [3005, 'gameStartResponse'],
  START_GAME_NOTIFICATION: [3006, 'gameStartNotification'],

  // 플레이어
  PLAYER_UPDATE_POSITION_REQUEST: [4001, 'positionUpdateRequest'],
  PLAYER_UPDATE_POSITION_NOTIFICATION: [4002, 'positionUpdateNotification'],
  PLAYER_UPDATE_HP_NOTIFICATION: [4003, 'playerHpUpdateNotification'],
  PLAYER_ATTACK_REQUEST: [4004, 'playerAttackRequest'],
  PLAYER_ATTACK_NOTIFICATION: [4005, 'playerAttackNotification'],
  PLAYER_DEATH_NOTIFICATION: [4006, 'playerDeathNotification'],
  FOOD_EAT_REQUEST: [4007, 'eatFoodRequest'],
  FOOD_EAT_RESPONSE: [4008, 'eatFoodResponse'],
  USER_UPDATE_NOTIFICATION: [4040, 'userUpdateNotification'],

  // 몬스터
  MONSTER_SPAWN_NOTIFICATION: [5001, 'monsterSpawnNotification'],
  MONSTER_AWAKE_NOTIFICATION: [5002, 'monsterAwakeNotification'],
  MONSTER_MOVE_NOTIFICATION: [5003, 'monsterMoveNotification'],
  MONSTER_DEATH_NOTIFICATION: [5004, 'monsterDeathNotification'],
  MONSTER_HP_UPDATE_NOTIFICATION: [5005, 'monsterHpUpdateNotification'],
};
