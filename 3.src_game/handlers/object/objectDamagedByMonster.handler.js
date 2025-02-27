import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

const objectDamagedByMonsterHandler = async ({ socket, payload, userId }) => {
  const { objectId, monsterId } = payload;

  const user = userSession.getUser(userId);
  if (!user) throw new CustomError(`User ID : (${userId}): 유저 정보가 없습니다.`);

  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID : (${user.getGameId()}): Game 정보가 없습니다.`);

  const monster = game.getMonsterById(monsterId);
  if (!monster) throw new CustomError(`Monster ID : ${monsterId}는 존재하지 않습니다.`);

  // 오브젝트에 따라 다르게 적용
  let payload = null;
  switch (objectId) {
    case 1:
      const coreHp = game.coreDamaged(monster.getAttack());
      console.log(`코어가 ${monster.getAttack()}의 데미지를 받았습니다! HP: ${coreHp}`);
      payload = { objectId: objectId, hp: coreHp };
      break;
    // 여기에 맘대로 쓰세요
    default:
      break;
  }

  const objectHpUpdateNotification = [config.packetType.S_OBJECT_HP_UPDATE_NOTIFICATION, payload];
  game.broadcast(objectHpUpdateNotification);
};
export default objectDamagedByMonsterHandler;
