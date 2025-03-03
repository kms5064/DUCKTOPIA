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
  LOGOUT_CAST: [1006, 'logout'],

  // 분산 서버 이동
  PREPARE_GAME_SERVER: [1501, 'gameServerPrepare'],
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
  PREPARE_GAME_RESPONSE: [3002, 'gamePrepareResponse'],
  PREPARE_GAME_NOTIFICATION: [3003, 'gamePrepareNotification'],
  START_GAME_REQUEST: [3004, 'gameStartRequest'],
  START_GAME_RESPONSE: [3005, 'gameStartResponse'],
  START_GAME_NOTIFICATION: [3006, 'gameStartNotification'],

  // 플레이어 기본 동작
  C_PLAYER_POSITION_UPDATE_REQUEST: [4001, 'playerPositionUpdateRequest'],
  S_PLAYER_POSITION_UPDATE_NOTIFICATION: [4002, 'playerPositionUpdateNotification'],
  S_PLAYER_HP_UPDATE_NOTIFICATION: [4003, 'playerHpUpdateNotification'],
  C_PLAYER_ATTACK_REQUEST: [4004, 'playerAttackRequest'],
  C_PLAYER_ATTACK_MONSTER_REQUEST: [4005, 'playerAttackMonsterRequest'],
  S_PLAYER_ATTACK_NOTIFICATION: [4006, 'playerAttackNotification'],
  S_PLAYER_DEATH_NOTIFICATION: [4007, 'playerDeathNotification'],
  C_PLAYER_GET_ITEM_REQUEST: [4008, 'playerGetItemRequest'], // S_ -> C_로 변경
  C_PLAYER_USE_ITEM_REQUEST: [4009, 'playerUseItemRequest'],
  S_PLAYER_EAT_FOOD_RESPONSE: [4010, 'playerEatFoodResponse'],
  S_PLAYER_EQUIP_WEAPON_RESPONSE: [4011, 'playerEquipWeaponResponse'],
  C_PLAYER_DAMAGED_BY_MONSTER_REQUEST: [4012, 'playerDamagedByMonsterRequest'],
  C_PLAYER_OPEN_BOX_REQUEST: [4013, 'playerOpenBoxRequest'],
  S_PLAYER_OPEN_BOX_NOTIFICATION: [4014, 'playerOpenBoxNotification'],
  C_PLAYER_TAKE_OUT_AN_ITEM_REQUEST: [4015, 'playerTakeOutAnItemRequest'],
  S_PLAYER_TAKE_OUT_AN_ITEM_NOTIFICATION: [4016, 'playerTakeOutAnItemNotification'],
  C_PLAYER_PUT_AN_ITEM_REQUEST: [4017, 'playerPutAnItemRequest'],
  S_PLAYER_PUT_AN_ITEM_NOTIFICATION: [4018, 'playerPutAnItemNotification'],
  C_PLAYER_CLOSE_BOX_REQUEST: [4019, 'playerCloseBoxRequest'],
  S_PLAYER_CLOSE_BOX_NOTIFICATION: [4020, 'playerCloseBoxNotification'],
  //---- 2025.02.21 추가 : 오누리
  S_ITEM_SPAWN_NOTIFICATION: [4021, 'itemSpawnNotification'],
  S_PLAYER_GET_ITEM_NOTIFICATION: [4022, 'playerGetItemNotification'],
  //---- 추가 완료
  S_PLAYER_HUNGER_UPDATE_NOTIFICATION: [4023, 'playerHungerUpdateNotification'],
  //03추가
  S_PLAYER_CHATTING_REQUEST: [4024, 'playerChattingRequest'],
  S_PLAYER_CHATTING_NOTIFICATION: [4025, 'playerChattingNotification'],
  S_PLAYER_REVIVAL_NOTIFICATION: [4026, 'playerRevivalNotification'],
  C_PLAYER_SET_OBJECT_REQUEST: [4027, 'playerSetObjectRequest'],
  S_PLAYER_SET_OBJECT_RESPONSE: [4028, 'playerSetObjectResponse'],
  S_OBJECT_SET_NOTIFICATION: [4029, 'objectSetNotification'],

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
  S_OBJECT_HP_UPDATE_NOTIFICATION: [6001, 'objectHpUpdateNotification'],
  C_OBJECT_DAMAGED_BY_MONSTER_REQUEST: [6002, 'objectDamagedByMonsterRequest'],
  S_GAME_OVER_NOTIFICATION: [6003, 'gameOverNotification'],
  //03추가
  C_OBJECT_DAMAGED_BY_PLAYER_REQUEST: [6004, 'objectDamagedByPlayerRequest'],
  S_OBJECT_DESTROY_NOTIFICATION: [6005, 'objectDestroyNotification'],

  // 에러
  S_ERROR_NOTIFICATION: [7001, 'errorNotification'],

  // 낮 밤 전환
  S_GAME_PHASE_UPDATE_NOTIFICATION: [8001, 'gamePhaseUpdateNotification'],
};
