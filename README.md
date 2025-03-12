# DUCKTOPIA: The Mustard Wars

## Gateway Server
```
1rc_gateway
├─ classes
│  ├─ server
│  │  ├─ server.class.js
│  │  └─ serverSession.class.js
│  └─ user
│     ├─ user.class.js
│     └─ userSession.class.js
├─ config
│  ├─ config.js
│  └─ constants
│     ├─ env.js
│     ├─ header.js
│     └─ server.js
├─ db
│  ├─ database.js
│  ├─ migrations
│  │  └─ createSchemas.js
│  ├─ redis
│  │  ├─ redis.js
│  │  └─ subscribe
│  │     ├─ connectServer.js
│  │     ├─ updateInGame.js
│  │     └─ userOut.js
│  ├─ sql
│  │  └─ user.db.sql
│  └─ user
│     ├─ user.db.js
│     └─ user.queries.js
├─ events
│  ├─ game
│  │  ├─ onGameConnection.js
│  │  ├─ onGameData.js
│  │  ├─ onGameEnd.js
│  │  └─ onGameError.js
│  ├─ lobby
│  │  ├─ onLobbyConnection.js
│  │  ├─ onLobbyData.js
│  │  ├─ onLobbyEnd.js
│  │  └─ onLobbyError.js
│  ├─ onConnection.js
│  ├─ onData.js
│  ├─ onEnd.js
│  └─ onError.js
├─ handlers
│  ├─ index.js
│  ├─ server
│  │  ├─ gameStart.handler.js
│  │  ├─ latencyCheck.handler.js
│  │  ├─ onGameServer.handler.js
│  │  └─ onLobbyServer.handler.js
│  └─ user
│     ├─ signIn.handler.js
│     └─ signUp.handler.js
├─ init
│  ├─ initServer.js
│  ├─ loadProtos.js
│  └─ serverOnRedis.js
├─ protobuf
│  ├─ main.proto
│  └─ packetNames.js
├─ server.js
├─ sessions
│  └─ session.js
└─ utils
   ├─ dateFormatter.js
   ├─ error
   │  ├─ customError.js
   │  └─ errorHandler.js
   └─ packet
      ├─ makePacket.js
      └─ makeServerPacket.js
 ```

### 역할
- ~~~를 담당하는 서버입니다.

### 핸들러
- gameStart.handler
    - 설명
- latencyCheck.handler
    - 설명
- onGameServer.handler
    - 설명
- onLobbyServer.handler
    - 설명

## Lobby Server
```
2.src_lobby
├─ classes
│  ├─ room
│  │  ├─ room.class.js
│  │  └─ roomSession.class.js
│  └─ user
│     ├─ user.class.js
│     └─ userSession.class.js
├─ config
│  ├─ config.js
│  └─ constants
│     ├─ character.js
│     ├─ core.js
│     ├─ env.js
│     ├─ game.js
│     ├─ header.js
│     ├─ map.js
│     ├─ monster.js
│     └─ player.js
├─ db
│  └─ redis
│     ├─ redis.js
│     └─ subscribe
│        ├─ deleteRoom.js
│        └─ healthCheck.js
├─ events
│  ├─ onConnection.js
│  ├─ onData.js
│  ├─ onEnd.js
│  └─ onError.js
├─ handlers
│  ├─ game
│  │  ├─ deleteRoom.handler.js
│  │  └─ gamePrepareReq.handler.js
│  ├─ index.js
│  ├─ room
│  │  ├─ createRoom.handler.js
│  │  ├─ getRoomList.handler.js
│  │  ├─ joinRoom.handler.js
│  │  └─ leaveRoom.handler.js
│  ├─ server
│  │  └─ latencyCheck.handler.js
│  └─ user
│     ├─ loginCast.handler.js
│     └─ logoutCast.handler.js
├─ init
│  ├─ initServer.js
│  ├─ loadProtos.js
│  └─ serverOnRedis.js
├─ protobuf
│  ├─ main.proto
│  └─ packetNames.js
├─ server.js
├─ sessions
│  └─ session.js
└─ utils
   ├─ calculate.js
   ├─ dateFormatter.js
   ├─ error
   │  ├─ customError.js
   │  └─ errorHandler.js
   └─ packet
      └─ makePacket.js
```

### 역할
- ~~~를 담당하는 서버입니다.

### 핸들러
- deleteRoom.handler
    - 설명
- gamePrepareReq.handler
    - 설명
- createRoom.handler
    - 설명
- getRoomList.handler
    - 설명
- joinRoom.handler
    - 설명
- leaveRoom.handler
    - 설명
- latencyCheck.handler
    - 설명
- loginCast.handler
    - 설명
- logoutCast.handler
    - 설명

## Game Server
```
3.src_game
├─ classes
│  ├─ base
│  │  ├─ destructibleObjectBase.class.js
│  │  ├─ destructibleObjectBase.class2.js
│  │  └─ movableObjectBase.class.js
│  ├─ core
│  │  └─ core.class.js
│  ├─ game
│  │  ├─ bossMonster.class.js
│  │  ├─ game.class.js
│  │  ├─ gameSession.class.js
│  │  ├─ monster.class.js
│  │  └─ player.class.js
│  ├─ item
│  │  ├─ item.class.js
│  │  ├─ itemBox.class.js
│  │  └─ itemManager.class.js
│  ├─ object
│  │  ├─ grass.class.js
│  │  └─ wall.class.js
│  ├─ server
│  │  └─ serverSession.class.js
│  └─ user
│     ├─ user.class.js
│     └─ userSession.class.js
├─ config
│  ├─ config.js
│  └─ constants
│     ├─ character.js
│     ├─ core.js
│     ├─ env.js
│     ├─ game.js
│     ├─ header.js
│     ├─ item.js
│     ├─ map.js
│     ├─ monster.js
│     ├─ objects.js
│     └─ player.js
├─ db
│  ├─ database.js
│  └─ redis
│     ├─ redis.js
│     └─ subscribe
│        └─ healthCheck.js
├─ events
│  ├─ onConnection.js
│  ├─ onData.js
│  ├─ onEnd.js
│  └─ onError.js
├─ handlers
│  ├─ game
│  │  ├─ chatting.handler.js
│  │  ├─ createGame.handler.js
│  │  ├─ startGame.handler.js
│  │  └─ waveStart.handler.js
│  ├─ index.js
│  ├─ item
│  │  ├─ closeBox.handler.js
│  │  ├─ equipmentUpgrade.handler.js
│  │  ├─ getItem.handler.js
│  │  ├─ openBox.handler.js
│  │  ├─ putAnItem.handler.js
│  │  └─ takeOutAnItem.handler.js
│  ├─ monster
│  │  ├─ monsterAttack.handler.js
│  │  └─ monsterMoveNotification.handler.js
│  ├─ object
│  │  ├─ objectAttackedByPlayer.handler.js
│  │  ├─ objectDamagedByMonster.handler.js
│  │  └─ objectMount.handler.js
│  ├─ player
│  │  ├─ attackPlayer.handler.js
│  │  ├─ attackPlayerMonster.handler.js
│  │  ├─ detachmentItem.handler.js
│  │  ├─ dropItem.handler.js
│  │  ├─ playerDamagedByMonster.js
│  │  ├─ updateLocation.handler.js
│  │  └─ useItem.handler.js
│  └─ server
│     ├─ latencyCheck.handler.js
│     └─ logoutCast.handler.js
├─ init
│  ├─ assets.js
│  ├─ initServer.js
│  ├─ loadProtos.js
│  └─ serverOnRedis.js
├─ protobuf
│  ├─ main.proto
│  └─ packetNames.js
├─ server.js
├─ sessions
│  └─ session.js
└─ utils
   ├─ calculate.js
   ├─ dateFormatter.js
   ├─ error
   │  ├─ customError.js
   │  └─ errorHandler.js
   └─ packet
      └─ makePacket.js
assets
├─ armor_accessory.json
├─ armor_bottom.json
├─ armor_helmet.json
├─ armor_shoes.json
├─ armor_top.json
├─ dropTable.json
├─ dropTable_ori.json
├─ etcObject.json
├─ food.json
├─ monster.json
├─ monster_ori.json
├─ objectDropTable.json
├─ objects.json
├─ profanity.json
├─ upgradeRate.json
└─ weapon.json
```

### 역할
- ~~~를 담당하는 서버입니다.

### 핸들러
- chatting.handler
    - 설명
- createGame.handler
    - 설명
- startGame.handler
    - 설명
- waveStart.handler
    - 설명
- closeBox.handler
    - 설명
- openBox.handler
    - 설명
- putAnItem.handler
    - 설명
- takeOutAnItem.handler
    - 설명
- equipmentUpgrade.handler
    - 설명
- getItem.handler
    - 설명
- monsterAttack.handler
    - 설명
- monsterMoveNotification.handler
    - 설명
- objectAttackedByPlayer.handler
    - 설명
- objectDamagedByMonster.handler
    - 설명
- objectMount.handler
    - 설명
- attackPlayer.handler
    - 설명
- attackPlayerMonster.handler
    - 설명
- detachmentItem.handler
    - 설명
- dropItem.handler
    - 설명
- playerDamagedByMonster.handler
    - 설명
- updateLocation.handler
    - 설명
- useItem.handler
    - 설명