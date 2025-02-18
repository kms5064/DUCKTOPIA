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

  // 플레이어 기본 동작
  C_PLAYER_POSITION_UPDATE_REQUEST: [4001, 'playerPositionUpdateRequest'],
  S_PLAYER_POSITION_UPDATE_NOTIFICATION: [4002, 'playerPositionUpdateNotification'],
  S_PLAYER_HP_UPDATE_NOTIFICATION: [4003, 'playerHpUpdateNotification'],
  C_PLAYER_ATTACK_REQUEST: [4004, 'playerAttackRequest'],
  C_PLAYER_ATTACK_MONSTER_REQUEST: [4005, 'playerAttackMonsterRequest'],
  S_PLAYER_ATTACK_NOTIFICATION: [4006, 'playerAttackNotification'],
  S_PLAYER_DEATH_NOTIFICATION: [4007, 'playerDeathNotification'],
  C_PLAYER_DAMAGED_BY_MONSTER_REQUEST: [4008, 'playerDamagedByMonsterRequest'],

  // 아이템 스폰/습득
  S_ITEM_SPAWN_NOTIFICATION: [5001, 'itemSpawnNotification'],
  C_PLAYER_GET_ITEM_REQUEST: [5002, 'playerGetItemRequest'],
  S_PLAYER_GET_ITEM_NOTIFICATION: [5003, 'playerGetItemNotification'],

  // 아이템 사용
  C_PLAYER_USE_ITEM_REQUEST: [6001, 'playerUseItemRequest'],
  S_PLAYER_EAT_FOOD_RESPONSE: [6002, 'playerEatFoodResponse'],
  S_PLAYER_EQUIP_WEAPON_RESPONSE: [6003, 'playerEquipWeaponResponse'],

  // 아이템 박스 시스템
  C_PLAYER_OPEN_BOX_REQUEST: [7001, 'playerOpenBoxRequest'],
  S_PLAYER_OPEN_BOX_NOTIFICATION: [7002, 'playerOpenBoxNotification'],
  C_PLAYER_TAKE_OUT_AN_ITEM_REQUEST: [7003, 'playerTakeOutAnItemRequest'],
  S_PLAYER_TAKE_OUT_AN_ITEM_NOTIFICATION: [7004, 'playerTakeOutAnItemNotification'],
  C_PLAYER_PUT_AN_ITEM_REQUEST: [7005, 'playerPutAnItemRequest'],
  S_PLAYER_PUT_AN_ITEM_NOTIFICATION: [7006, 'playerPutAnItemNotification'],
  C_PLAYER_CLOSE_BOX_REQUEST: [7007, 'playerCloseBoxRequest'],
  S_PLAYER_CLOSE_BOX_NOTIFICATION: [7008, 'playerCloseBoxNotification'],

  // 몬스터
  S_MONSTER_SPAWN_REQUEST: [8001, 'monsterSpawnRequest'],
  C_MONSTER_SPAWN_RESPONSE: [8002, 'monsterSpawnResponse'],
  S_MONSTER_WAVE_START_NOTIFICATION: [8003, 'monsterWaveStartNotification'],
  S_MONSTER_AWAKE_NOTIFICATION: [8004, 'monsterAwakeNotification'],
  S_MONSTER_DEATH_NOTIFICATION: [8005, 'monsterDeathNotification'],
  C_MONSTER_MOVE_REQUEST: [8006, 'monsterMoveRequest'],
  S_MONSTER_MOVE_NOTIFICATION: [8007, 'monsterMoveNotification'],
  C_MONSTER_ATTACK_REQUEST: [8008, 'monsterAttackRequest'],
  S_MONSTER_ATTACK_NOTIFICATION: [8009, 'monsterAttackNotification'],
  S_MONSTER_HP_UPDATE_NOTIFICATION: [8010, 'monsterHpUpdateNotification'],

  // 코어
  S_OBJECT_HP_UPDATE_NOTIFICATION: [9001, 'objectHpUpdateNotification'],
  C_OBJECT_DAMAGED_BY_MONSTER_REQUEST: [9002, 'objectDamagedByMonsterRequest'],
  S_GAME_OVER_NOTIFICATION: [9003, 'gameOverNotification'],

  // 에러
  S_ERROR_NOTIFICATION: [10001, 'errorNotification'],

  // 낮 밤 전환
  S_GAME_PHASE_UPDATE_NOTIFICATION: [11001, 'gamePhaseUpdateNotification'],
};
