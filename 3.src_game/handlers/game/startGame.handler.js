import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';
import { DayPhase } from '../../config/constants/game.js';

const startGameHandler = ({ socket, payload, userId }) => {
  const { monsters, objects } = payload; //좌표가 objects에 들어있고 그걸 서버에 저장

  const user = userSession.getUser(userId);
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError('게임 생성에 실패했습니다!');

  monsters.forEach((monster) => {
    // 생성 구역 체크
    // if (!game.checkSpawnArea(monster.monsterCode, monster.x, monster.y)) {
    //   throw new CustomError(
    //     `Monster ID: ${monster.monsterId} Monster Code : ${monster.monsterCode} 의 생성 구역이 적합하지 않습니다. (${monster.x},${monster.y})`,
    //   );
    // }
    // 몬스터 : 클라에서 생성된 좌표 값으로 변경
    game.getMonsterById(monster.monsterId).setStartPosition(monster.x, monster.y);
  });

  const initialItems = game.createInitialItems();

  objects.forEach((object) => {
    // 코어 제외
    if (object.ObjectData.objectId === 1) return 

    const serverObj = game.getObjectById(object.ObjectData.objectId)
    serverObj.setPosition(object.x, object.y);
  });

  // [테스트] 인덱스 0, 1에 고정으로 아이템 추가
  game.users.forEach((user) => {
    // 1번 아이템은 0번 인덱스에
    user.player.addItem(1, 1, 0);
    // 101번 아이템은 1번 인덱스에
    user.player.addItem(101, 1, 1);
    user.player.addItem(901, 1, 2);
  });

  // 기존 코드 주석 처리 - 찐코드
  // game.players.forEach((player) => {
  //   initialItems.forEach((item) => {
  //     player.addItem(item.itemCode, item.count, null);
  //   });
  // });
  const startGameObject = [];

  const core = game.getCore();
  if (!core) throw new CustomError('코어 정보가 없습니다.');
  const coreData = core.getCoreData();

  startGameObject.push(coreData);

  [...game.objects.values()].forEach((obj) => {
    if(obj.id){
      const object = {
        ObjectData: { objectId: obj.id, objectCode: obj.objectCode },
        itemData: obj.itemList,
        x: obj.x,
        y: obj.y,
      };
      startGameObject.push(object);
    }
  // [...game.objects.values()].forEach((itemBoxObject) => {
  //   const itemBox = {
  //     ObjectData: { objectId: itemBoxObject.id, objectCode:itemBoxObject.objectCode },
  //     itemData: itemBoxObject.itemList,
  //     x: itemBoxObject.x,
  //     y: itemBoxObject.y,
  //   };
  //   startGameObject.push(itemBox);
   
  });

  const GameStartNotification = [
    config.packetType.START_GAME_NOTIFICATION,
    {
      gameState: { phaseType: 0, nextPhaseAt: config.game.phaseCount[DayPhase.DAY] + Date.now() }, //이삭님 코드에 이렇게돼있음!
      playerPositions: game.getUsersPositionData(),
      monsters: monsters,
      objects: startGameObject,
      items: initialItems,
    },
  ];

  game.gameLoopStart();
  game.broadcast(GameStartNotification);
};

export default startGameHandler;
