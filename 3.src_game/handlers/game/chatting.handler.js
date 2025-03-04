import { config } from '../../config/config.js';
import { userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

const chattingHandler = ({ socket, payload, userId }) => {
    const { playerId, message } = payload;

    const user = userSession.getUser(userId);
    if (!user) throw new CustomError('유저 정보가 없습니다.');

    // 게임 객체 조회
    const game = gameSession.getGame(user.getGameId());
    if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

    const chattingPayloadInfos = [
        config.packetType.S_PLAYER_CHATTING_NOTIFICATION,
        {
            playerId,
            message
        }
    ];

    game.broadcast(chattingPayloadInfos);
};

export default chattingHandler;