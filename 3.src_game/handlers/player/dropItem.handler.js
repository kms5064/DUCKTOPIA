import { userSession, gameSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';

const dropItemHandler = ({ socket, payload, userId }) => {
  const { itemData } = payload;

  const user = userSession.getUser(userId);
  if (!user) return;

  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  const player = user.player;
  const playerPosition = player.getPlayerPos();

  const itemIndex = player.findItemIndex(itemData.itemCode);
  if (itemIndex === -1) throw new CustomError('아이템을 찾을 수 없습니다.');

  const item = player.inventory[itemIndex];
  if (!item) throw new CustomError(`아이템 정보가 없습니다.`);

  const count = Math.min(itemData.count, item.count);
  if (count <= 0) throw new CustomError('아이템이 부족합니다');

  if (item) {
    const droppedItems = game.itemManager.playerDropItem(item.itemCode, count, playerPosition);

    player.removeItem(item.itemCode, count);

    const dropItemPacket = [
      config.packetType.S_DROP_ITEM_NOTIFICATION,
      {
        itemData: {
          itemCode: item.itemCode,
          count: count,
        },
        playerId: userId,
      },
    ];

    const spawnItemPacket = [
      config.packetType.S_ITEM_SPAWN_NOTIFICATION,
      {
        items: droppedItems,
      },
    ];

    game.broadcast(dropItemPacket);
    game.broadcast(spawnItemPacket);
  }
};

export default dropItemHandler;
