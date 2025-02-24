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

  let coreHp = game.getCoreHp();

  if (objectId === 1 && coreHp > 0) {
    coreHp = game.coreDamaged(monster.getAttack());
    console.log(`코어가 ${monster.getAttack()}의 데미지를 받았습니다! HP: ${coreHp}`);
    const payload = { objectId: objectId, hp: coreHp };
    const objectHpUpdateNotification = [config.packetType.S_OBJECT_HP_UPDATE_NOTIFICATION, payload];
    game.broadcast(objectHpUpdateNotification);
    if (coreHp <= 0) {
      console.log(`코어가 파괴되었습니다. HP: ${coreHp}`);
      const gameOverPayload = {};
      const gameOverNotification = [config.packetType.S_GAME_OVER_NOTIFICATION, gameOverPayload];
      game.broadcast(gameOverNotification);

      gameSession.removeGame(game);
    }
  }
};
export default objectDamagedByMonsterHandler;
