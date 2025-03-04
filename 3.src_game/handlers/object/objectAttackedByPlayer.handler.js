import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';
import Item from './item.class.js';
import { getGameAssets } from '../../init/assets.js';
s;
import CustomError from '../../utils/error/customError.js';

//파밍용 오브젝트들
const objectAttackedByPlayerHandler = async ({ socket, payload, userId }) => {
  const { objectId, playerId } = payload;

  const user = userSession.getUser(userId);
  if (!user) throw new CustomError(`User ID : (${userId}): 유저 정보가 없습니다.`);

  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID : (${user.getGameId()}): Game 정보가 없습니다.`);

  const player = game.getPlayerById(userId);
  if (!player) throw new CustomError(`Player ID : (${player.id}): Player 정보가 없습니다.`);

  //오브젝트 찾고
  const object = game.objects.find((object) => object && object.id === objectId);
  if (!object) throw new CustomError('오브젝트를 찾을 수 없습니다');

  const equippedWeaponCode = player.equippedWeapon.itemCode;
  const equippedWeapon = game.itemManager.weaponData.find(
    (weapon) => weapon.code === equippedWeaponCode,
  );
  //만약 sword,axe타입의 무기라면
  if (equippedWeapon.type === 'sword' || equippedWeapon.type === 'axe') {
    const objectHp = object.changeObjectHp(1); //체력깎고
    if (objectHp <= 0) {
      const itemId = game.itemManager.lastItemId++;

      const objectPosition = object.getPosition();
      //아이템 드랍하는 로직
      const dropItems = object.dropItems;

      const items = [];

      dropItems.array.forEach((ele) => {
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

      //itemManager에 fieldDropItems에 아이템들 추가하고
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
    }
  }
};
export default objectAttackedByPlayerHandler;
