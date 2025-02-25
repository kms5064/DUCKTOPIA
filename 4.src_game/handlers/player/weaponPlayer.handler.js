import { gameSession, userSession } from '../../sessions/session.js';
import { config } from '../../config/config.js';
import CustomError from '../../utils/error/customError.js';

const weaponPlayerHandler = ({ socket, payload, userId }) => {
  const { itemId } = payload;

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError(`User ID (${userId}): 유저 정보가 없습니다.`);

  // 룸 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID: (${user.getGameId()}) Game 정보가 없습니다.`);

  // TODO : NOTI용 패킷 추가 해야함.
  const packet = [
    config.packetType.S_PLAYER_EQUIP_WEAPON_RESPONSE,
    {
      success: true,
      itemId,
      playerId: userId,
    },
  ];
  game.broadcast(packet);
};

export default weaponPlayerHandler;
