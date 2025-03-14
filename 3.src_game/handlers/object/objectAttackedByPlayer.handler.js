import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';
import Item from '../../classes/item/item.class.js';
import CustomError from '../../utils/error/customError.js';

//파밍용 오브젝트들
const objectAttackedByPlayerHandler = async ({ socket, payload, userId }) => {
  const { objectId, playerDirX, playerDirY } = payload;

  const user = userSession.getUser(userId);
  if (!user) throw new CustomError(`User ID : (${userId}): 유저 정보가 없습니다.`);

  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID : (${user.getGameId()}): Game 정보가 없습니다.`);

  const player = user.player;
  if (!player) throw new CustomError(`Player ID : (${player.id}): Player 정보가 없습니다.`);

  //오브젝트 찾고
  const findObjectById = (map, objectId) => {
    for (const [_, obj] of map) {
      if (obj?.id === objectId) return obj;
    }
    return null;
  };
  const object = findObjectById(game.objects, objectId);
  if (!object) throw new CustomError('오브젝트를 찾을 수 없습니다');

  const equippedWeaponCode = player.equippedWeapon.itemCode;
  const equippedWeapon = game.itemManager.weaponData.find(
    (weapon) => weapon.code === equippedWeaponCode,
  );
  //만약 sword,axe타입의 무기라면
  if (equippedWeapon.type !== 'sword' && equippedWeapon.type !== 'axe') return;

  const objectHp = object.changeObjectHp(1); //체력깎고
  const sendPayload = { objectId: objectId, hp: objectHp };
  const objectHpUpdateNotification = [
    config.packetType.S_OBJECT_HP_UPDATE_NOTIFICATION,
    sendPayload,
  ];
  game.broadcast(objectHpUpdateNotification);

  if (objectHp > 0) return;

  const itemId = game.itemManager.lastItemId++;
  const objectPosition = object.getPosition();
  //아이템 드랍하는 로직
  const dropItems = object.dropItems;

  const items = [];

  dropItems.forEach((ele) => {
    for (let i = 0; i < ele.count; i++) {
      const item = new Item({
        itemData: {
          itemCode: ele.itemCode,
          count: 1,
        },
        position: game.itemManager.addRandomOffset(objectPosition),
      });
      game.itemManager.fieldDropItems.set(itemId, { itemId, ...item });
      items.push(item);
    }
  });

  //만들어진 아이템들 브로드캐스트
  const itemSpawnNotification = [
    config.packetType.S_ITEM_SPAWN_NOTIFICATION,
    {
      items: items,
    },
  ];
  game.broadcast(itemSpawnNotification);
  //////////////////////

  //상태 업데이트
  object.isDestroyed = true;
  const packet = { objectId: object.id };

  //파괴 notification
  const objectDestroyNotification = [config.packetType.S_OBJECT_DESTROY_NOTIFICATION, packet];
  game.broadcast(objectDestroyNotification);
};
export default objectAttackedByPlayerHandler;
