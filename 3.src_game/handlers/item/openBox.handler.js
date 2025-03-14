import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

const playerOpenBoxHandler = ({ socket, payload, userId }) => {
  const { itemBoxId } = payload;
  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError(`User ID : (${userId}): 유저 정보가 없습니다.`);

  // 룸 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  let itemList = [];
  if (config.game.itemBox.objectCoreCode === itemBoxId) {
    const core = game.getCore();
    if (core.occupied === null) {
      core.occupied = userId;

      itemList = core.getItemList();
      const payload = {
        playerId: userId,
        itemBoxId: itemBoxId,
        itemData: itemList,
      };

      const notification = [config.packetType.S_PLAYER_OPEN_BOX_NOTIFICATION, payload];
      game.broadcast(notification);
    }
  } else {
    const itemBox = game.getObjectById(itemBoxId);
    if (!itemBox) throw new CustomError(`itemBoxId : ${itemBoxId} 를 찾을 수 없습니다.`);

    //유효한 거리인지 검증
    //이 박스가 점유중이라면 컷
    //박스 오픈한채로 돌아다니면 박스 닫히게?
    if (itemBox.occupied === null) {
      itemBox.occupied = userId;
      itemList = itemBox.getItemList();
      const payload = {
        playerId: userId,
        itemBoxId: itemBoxId,
        itemData: itemList,
      };

      const notification = [config.packetType.S_PLAYER_OPEN_BOX_NOTIFICATION, payload];
      //이 유저가 열고 있다는거 브로드캐스트

      game.broadcast(notification);
    }
  }
};

export default playerOpenBoxHandler;
