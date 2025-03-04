import { config } from '../../config/config.js';
import { getGameAssets } from '../../init/assets.js';
import { gameSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

//코어를 포함한 몬스터와 적대적인 구조물들
const objectMountHandler = async ({ socket, payload, userId }) => {
    const { itemCode, position } = payload;
    const { objects, objectDropTable }= getGameAssets()

    const user = userSession.getUser(userId);
    if (!user) throw new CustomError(`User ID : (${userId}): 유저 정보가 없습니다.`);

    const player = user.player

    const game = gameSession.getGame(user.getGameId());
    if (!game) throw new CustomError(`Game ID : (${user.getGameId()}): Game 정보가 없습니다.`);

    const itemIndex = player.findItemIndex(itemCode);
    if (itemIndex === -1) throw new CustomError('아이템을 찾을 수 없습니다.');

    const item = player.inventory[itemIndex];
    const objectCode = objects.data.find((e) => e.code === itemCode).object
    if (objectCode === -1) throw new CustomError('잘못된 사용 입니다.');
    
    // 아이템 개수 감소
    player.removeItem(item.itemCode, 1);
    const payload1 = {
        success: true,
        itemCode,
        playerId: userId,
    }
    const playerSetObjectResponse = [
        config.packetType.S_PLAYER_SET_OBJECT_RESPONSE,
        payload1,
    ];
    game.broadcast(playerSetObjectResponse);

    // 오브젝트 설치
    const payload2 = game.createObject("wall", objectCode, position.x, position.y)
    const objectSetNotification = [
        config.packetType.S_OBJECT_SET_NOTIFICATION,
        payload2,
    ];
    game.broadcast(objectSetNotification);
};
export default objectMountHandler;
