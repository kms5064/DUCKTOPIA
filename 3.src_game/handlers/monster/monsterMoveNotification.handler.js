import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

//몬스터의 움직임을 동기화하는 핸들러.
//호스트 클라이언트에서 받은 움직임 정보를 여기에서 처리를 해주도록 하자.
const monsterMoveNotificationHandler = async ({ socket, payload, userId }) => {
  const { monsterPositionData } = payload;

  //플레이어가 어떤 게임에 속해 있는지 찾기
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError('유저 정보가 없습니다.');

  /**게임이 사라지거나 했을 때는 인식하지 못하도록 한다. */
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  // for (let i = 0; i < monsterPositionData.length; i++) {
  //   const monster = game.getMonsterById(monsterPositionData[i].monsterId);
  //   if (!monster) continue;
  //
  //   monster.setPosition(monsterPositionData[i].x, monsterPositionData[i].y);
  // }

  const monsterMoveNotification = [config.packetType.S_MONSTER_MOVE_NOTIFICATION, payload];

  //이런 식으로 게임에서 notification을 보내보도록 하자.
  // game.notification(userId, monsterMoveNotification);
};

export default monsterMoveNotificationHandler;
