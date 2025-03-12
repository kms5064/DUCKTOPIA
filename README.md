# DUCKTOPIA: The Mustard Wars
## Game Intro
![Image](https://github.com/user-attachments/assets/dd67c8f2-b8ff-4fd3-8680-1ce17bc6a9fa)
## Teammates
| 이름 | MBTI | 블로그 주소 | Github 주소 |
| --- | --- | --- | --- |
| 김제훈 (Leader) | INTJ | [블로그](https://jhkch.tistory.com/) | [GitHub](https://github.com/kms5064) |
| 오누리 (Sub Leader) | INTP | [블로그](https://velog.io/@ssini/posts) | [GitHub](https://github.com/ssini-oh) |
| 이준성 | INFP | [블로그](https://junstar96.github.io/) | [GitHub](https://github.com/junstar96) |
| 한윤재 | ISTP | [블로그](https://gureunda.tistory.com/) | [GitHub](https://github.com/yoon-H) |
| 이이삭 | ISTP | [블로그](https://dlrltn1091.tistory.com/) | [GitHub](https://github.com/cat10ho) |
| 이유민 | INFJ | [블로그](https://javacpp.tistory.com/) | [GitHub](https://github.com/JavaCPP0) |
| 조용필 | INTP | [블로그](https://bbie-6772.github.io/) | [GitHub](https://github.com/bbie-6772) |
| 김의중 | ISFP | [블로그](https://devrogues.github.io/) | [GitHub](https://github.com/DevRogues) |

## Technology Stack

### Language
-Javascript
-C#

### Backend
- Node.js  

### Database

### DevOps & Cloud
- AWS  
- Docker  
- GitHub Actions  

### Tools
- Git  
- Notion
- 
### Game Engine
- Unity  

## Game introduction
(임시)
2~8인 협동 생존 멀티게임으로 오리에게 점령당한 세상속에서 마지막 희망인 머스타드 공장을 지키며 필드에 흩어진 오리들을 잡아 계란과 꿀을 얻고 겨자를 찾아 겨자씨앗을 얻고 머스타드를 만들어 보스를 잡는 게임입니다.

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

### Description
- 로그인/회원가입 기능
   - 설명
- 게임 서버가 여러개일 경우 로드 벨런싱 후 연결
   - 설명
- 클라이언트와 다른 서버들(Lobby Server, Game Server)간의 연결을 총괄
   - 설명

### Handlers
- **gameStart.handler**
    - 설명
- **latencyCheck.handler**
    - 설명
- **onGameServer.handler**
    - 설명
- **onLobbyServer.handler**
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

### Description
- 방 생성/삭제 및 참여를 총괄
   - 설명

### Handlers
- **deleteRoom.handler**
    - 설명
- **gamePrepareReq.handler**
    - 설명
- **createRoom.handler**
    - 설명
- **getRoomList.handler**
    - 설명
- **joinRoom.handler**
    - 설명
- **leaveRoom.handler**
    - 설명
- **latencyCheck.handler**
    - 설명
- **loginCast.handler**
    - 설명
- **logoutCast.handler**
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

### Description
- 인게임 로직을 실질적으로 실행하는 서버
   - 설명
- CPU 부하가 많을 것으로 예상되어 2개로 운영
   - 설명

### Handlers
- **chatting.handler**
    - 설명
- **createGame.handler**
    - 설명
- **startGame.handler**
    - 설명
- **waveStart.handler**
    - 설명
- **openBox.handler**
   - 아이템 상자를 여는 핸들러
   - 클라이언트로부터 Box의 Id를 받아서 찾고 보유한 아이템을 조회 후 서버가 notifi전송
   - itemBox클래스에 occupied속성을 추가해 한명만 열 수 있게 설정
- **closeBox.handler**
   - 아이템 상자를 닫는 핸들러
   - 클라이언트로부터 Box의 Id를 받아서 찾고 어떤 상자를 닫은건지 동기화를 위한 boxId를 Notifi
   - occupied null로 초기화해서 점유중이지 않음을 표시
- **putAnItem.handler**
    - 코어(머스타드 공장)과 아이템박스에 아이템 넣는 핸들러
    - 클라이언트로부터 어떤오브젝트를 열었는지 boxId,어떤 아이템인지 itemCode, 몇개인지 count를 받고 유저 인벤토리에서 해당 아이템을 count만큼 차감하고(보유한 갯수보다 count가 크다면 count를 보유한갯수로 변경하고 아이템 삭제) 아이템 상자에 추가
    - 코어라면 특정아이템만 넣을 수 있고 조합식이 완성되면 새 아이템 생성
- **takeOutAnItem.handler**
    - 코어(머스타드 공장)과 아이템박스에서 아이템 꺼내는 핸들러
    - 클라이언트로부터 어떤오브젝트를 열었는지 boxId,어떤 아이템인지 itemCode, 몇개인지 count를 받고 박스 인벤토리에서 해당 아이템을 count만큼 추가하고(보유한 갯수보다 count가 크다면 count를 보유한갯수로 변경하고 아이템 삭제) 유저 인벤토리에 추가
- **equipmentUpgrade.handler**
    - 설명
- **getItem.handler**
    - 설명
- **monsterAttack.handler**
    - 설명
- **monsterMoveNotification.handler**
    - 설명
- **objectAttackedByPlayer.handler**
    - 설명
- **objectDamagedByMonster.handler**
    - 설명
- **objectMount.handler**
    - 설명
- **attackPlayer.handler**
    - 설명
- **attackPlayerMonster.handler**
    - 설명
- **detachmentItem.handler**
    - 장착된 장비를 탈착하는 핸들러
    - itemCode를 받고 코드의 번호의 맨 앞자리로 부위를 판별해서 그 부위에 장착된 itemCode와 받은 itemCode가 일치하는지 검증하고 일치하면 유저의 장착장비속성을 null로 바꾸고 인벤토리에 아이템 추가
- **dropItem.handler**
    - 설명
- **playerDamagedByMonster.handler**
    - 설명
- **updateLocation.handler**
    - 설명
- **useItem.handler**
    - 설명
