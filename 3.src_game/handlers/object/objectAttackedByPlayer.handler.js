import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';
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

      //아이템 드랍하는 메서드

      //////////////////////
      object.isDestroyed = true;
      const packet = {objectId: object.id};

      //파괴 notification
      const objectDestroyNotification = [config.packetType.S_OBJECT_DESTROY_NOTIFICATION, packet];
      game.broadcast(objectDestroyNotification);
    }
  }

  //만약 3번쳤으면 아이템 드랍하고 상태 업데이트하고
};
export default objectAttackedByPlayerHandler;
