import { userSession, gameSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';

const dropItemHandler = ({ socket, payload, userId }) => {
  const { itemData } = payload;

  const user = userSession.getUser(userId);
  if (!user) throw new CustomError(`User ID : (${userId}): 유저 정보가 없습니다.`);

  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  const player = user.player;

  const itemIndex = player.findItemIndex(itemData.itemCode);
  if (itemIndex === -1) throw new CustomError('아이템을 찾을 수 없습니다.');

  const item = player.inventory[itemIndex];
  if (!item) throw new CustomError(`아이템 정보가 없습니다.`);

  let packet;

  if (item) {
    player.removeItem(item.itemCode, 1);

    packet = [
      config.packetType.S_DROP_ITEM_NOTIFICATION,
      {
        itemData: {
          itemCode: item.itemCode,
          count: 1,
        },
        playerId: userId,
      },
    ];
  }
};

export default dropItemHandler;