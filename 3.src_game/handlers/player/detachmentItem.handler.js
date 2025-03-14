import { gameSession, userSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';

const detachmentItemHandler = ({ socket, payload, userId }) => {
  const { itemCode } = payload;

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) return

  const player = user.player;

  // 게임 객체(세션) 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID: (${user.getGameId()}) Game 정보가 없습니다.`);
  let item;
  let itemType;
  switch (true) {
    case itemCode >= 101 && itemCode <= 200: //weapon
      item = player.detachWeapon(itemCode);
      break;
    case itemCode >= 301 && itemCode <= 400: //top
      itemType = 'top';
      item = player.detachArmor(itemType, itemCode);
      break;
    case itemCode >= 401 && itemCode <= 500: //bottom
      itemType = 'bottom';
      item = player.detachArmor(itemType, itemCode);

      break;
    case itemCode >= 501 && itemCode <= 600: //shoes
      itemType = 'shoes';
      item = player.detachArmor(itemType, itemCode);

      break;
    case itemCode >= 601 && itemCode <= 700: //helmet
      itemType = 'helmet';
      item = player.detachArmor(itemType, itemCode);

      break;
    case itemCode >= 701 && itemCode <= 800: //accessory
      itemType = 'accessory';
      item = player.detachArmor(itemType, itemCode);

      break;
    default:
      throw new CustomError('알 수 없는 아이템 타입입니다.');
  }

  const packet = [
    config.packetType.S_ITEM_DETACHMENT_NOTIFICATION,
    {
      itemCode: item.itemCode,
      playerId: player.id,
    },
  ];
  game.broadcast(packet);

};

export default detachmentItemHandler;
