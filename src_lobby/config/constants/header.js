export const PACKET_TYPE_BYTE = 2;
export const VERSION_LENGTH_BYTE = 1;
export const USER_ID_LENGTH_BYTE = 1;
export const PAYLOAD_LENGTH_BYTE = 4;

export const PACKET_TYPE = {
  // 유저 회원가입,로그인
  REGISTER_REQUEST: [1001, 'registerRequest'],
  REGISTER_RESPONSE: [1002, 'registerResponse'],
  LOGIN_REQUEST: [1003, 'loginRequest'],
  LOGIN_RESPONSE: [1004, 'loginResponse'],
  LOGIN_CAST: [1005, 'loginCast'],

  // 분산 서버 이동
  PREPARE_GAME_RESPONSE: [1501, 'gamePrepareResponse'],
  JOIN_SERVER_REQUEST: [1502, 'gameServerJoinRequest'],

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
  PREPARE_GAME_NOTIFICATION: [3002, 'gamePrepareNotification'],
  GAME_INFOS_REQUEST: [3003, 'gameInfosRequest'],
  START_GAME_REQUEST: [3004, 'gameStartRequest'],
  START_GAME_RESPONSE: [3005, 'gameStartResponse'],
  START_GAME_NOTIFICATION: [3006, 'gameStartNotification'],

  // 플레이어
  C_PLAYER_POSITION_UPDATE_REQUEST: [4001, 'playerPositionUpdateRequest'],
  S_PLAYER_POSITION_UPDATE_NOTIFICATION: [4002, 'playerPositionUpdateNotification'],
  S_PLAYER_HP_UPDATE_NOTIFICATION: [4003, 'playerHpUpdateNotification'],
  C_PLAYER_ATTACK_REQUEST: [4004, 'playerAttackRequest'],
  C_PLAYER_ATTACK_MONSTER_REQUEST: [4005, 'playerAttackMonsterRequest'],
  S_PLAYER_ATTACK_NOTIFICATION: [4006, 'playerAttackNotification'],
  S_PLAYER_DEATH_NOTIFICATION: [4007, 'playerDeathNotification'],
  S_PLAYER_GET_ITEM_REQUEST: [4008, 'playerGetItemRequest'],
  C_PLAYER_USE_ITEM_REQUEST: [4009, 'playerUseItemRequest'],
  S_PLAYER_EAT_FOOD_RESPONSE: [4010, 'playerEatFoodResponse'],
  S_PLAYER_EQUIP_WEAPON_RESPONSE: [4011, 'playerEquipWeaponResponse'],
  S_PLAYER_DAMAGED_BY_MONSTER: [4012, 'playerDamagedByMonster'],

  // 몬스터
  S_MONSTER_SPAWN_REQUEST: [5001, 'monsterSpawnRequest'],
  C_MONSTER_SPAWN_RESPONSE: [5002, 'monsterSpawnResponse'],
  S_MONSTER_WAVE_START_NOTIFICATION: [5003, 'monsterWaveStartNotification'],
  S_MONSTER_AWAKE_NOTIFICATION: [5004, 'monsterAwakeNotification'],
  S_MONSTER_DEATH_NOTIFICATION: [5005, 'monsterDeathNotification'],
  C_MONSTER_MOVE_REQUEST: [5006, 'monsterMoveRequest'],
  S_MONSTER_MOVE_NOTIFICATION: [5007, 'monsterMoveNotification'],
  C_MONSTER_ATTACK_REQUEST: [5008, 'monsterAttackRequest'],
  S_MONSTER_ATTACK_NOTIFICATION: [5009, 'monsterAttackNotification'],
  S_MONSTER_HP_UPDATE_NOTIFICATION: [5010, 'monsterHpUpdateNotification'],

  // 코어
  S_CORE_HP_UPDATE_NOTIFICATION: [6001, 'coreHpUpdateNotification'],
  S_GAME_OVER_NOTIFICATION: [6002, 'gameOverNotification'],

  // 에러
  S_ERROR_NOTIFICATION: [7001, 'errorNotification'],
};
