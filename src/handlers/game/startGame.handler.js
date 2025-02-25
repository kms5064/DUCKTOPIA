import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import CustomError from '../../utils/error/customError.js';
import { DayPhase } from '../../config/constants/game.js';

const gameStartHandler = ({ socket, payload }) => {
  const { monsters, objects } = payload; //좌표가 objects에 들어있고 그걸 서버에 저장

  const user = userSession.getUser(socket.id);
  const room = roomSession.getRoom(user.roomId);

  if (!room) {
    throw new CustomError('방 생성에 실패했습니다!');
  }

  const game = room.getGame();
  if (!game) {
    throw new CustomError('게임 생성에 실패했습니다!');
  }

  monsters.forEach((monster) => {
    // 생성 구역 체크
    // if (!game.checkSpawnArea(monster.monsterCode, monster.x, monster.y)) {
    //   throw new CustomError(
    //     `Monster ID: ${monster.monsterId} Monster Code : ${monster.monsterCode} 의 생성 구역이 적합하지 않습니다. (${monster.x},${monster.y})`,
    //   );
    // }
    // 몬스터 : 클라에서 생성된 좌표 값으로 변경
    game.getMonsterById(monster.monsterId).setStartPosition(monster.x, monster.y);
    game.getMonsterById(monster.monsterId).setPosition(monster.x, monster.y);
  });

  objects.forEach((object) => {
    if (object.ObjectData.objectCode === 2) {
      game.getItemBoxById(object.ObjectData.objectId).setPosition(object.x, object.y);
    }
  });

  //---- 2025.02.24 초기 아이템 생성 추가
  // 초기 아이템 생성
  const initialItems = game.createInitialItems();

  // [테스트] 인덱스 0, 1에 고정으로 아이템 추가
  game.players.forEach((player) => {
    // console.log('\n[아이템 추가 전] 플레이어 인벤토리:', player.inventory);

    // 1번 아이템은 0번 인덱스에
    player.addItem(1, 1, 0);
    // console.log('[1번 아이템 추가 후] 인벤토리:', player.inventory);

    // 101번 아이템은 1번 인덱스에
    player.addItem(101, 1, 1);
    // console.log('[101번 아이템 추가 후] 인벤토리:', player.inventory);
  });

  // 기존 코드 주석 처리 - 찐코드
  // game.players.forEach((player) => {
  //   initialItems.forEach((item) => {
  //     player.addItem(item.itemCode, item.count, null);
  //   });
  // });

  const startGameObject = [];
  const coreData = {
    ObjectData: { objectId: 1, objectCode: 1 },
    itemData: [],
    x: 0,
    y: 0,
  };
  startGameObject.push(coreData);
  game.objects.values().forEach((itemBoxobject) => {
    const itemBox = {
      ObjectData: { objectId: itemBoxobject.id, objectCode: 2 },
      itemData: itemBoxobject.itemList,
      x: itemBoxobject.x,
      y: itemBoxobject.y,
    };
    startGameObject.push(itemBox);
  });

  const GameStartNotification = makePacket(config.packetType.START_GAME_NOTIFICATION, {
    gameState: { phaseType: 0, nextPhaseAt: config.game.phaseCount[DayPhase.DAY] + Date.now() }, //이삭님 코드에 이렇게돼있음!
    playerPositions: room.getUsersPositionData(),
    monsters: monsters,
    objects: startGameObject,
    items: initialItems, // 초기 아이템 추가
  });

  room.startGame();
  room.broadcast(GameStartNotification);
};

export default gameStartHandler;
