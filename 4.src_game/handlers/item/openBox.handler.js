import CustomError from '../../utils/error/customError.js';
import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';

const playerOpenBoxHandler = ({ socket, payload, userId }) => {
  const { itemBoxId } = payload;
  console.log(`openBoxHandler itemBoxId: ${itemBoxId}`);

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError(`User ID : (${userId}): 유저 정보가 없습니다.`);

  // 룸 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  game.addBox(); //테스트용

  const itemBox = game.getItemBoxById(itemBoxId);
  if (!itemBox) throw new CustomError('상자를 찾을 수 없습니다');

  //유효한 거리인지 검증
  //이 박스가 점유중이라면 컷
  //박스 오픈한채로 돌아다니면 박스 닫히게?
  //  if (
  //    itemBox.calculateDistance <= config.game.VALID_DISTANCE_OF_BOX &&
  //    itemBox.occupied !== null
  //  ) {
  //    itemBox.occupied = player.id;

  //    const itemList = itemBox.getItemList();
  //    const payload = {
  //      playerId: player.id,
  //      itemBoxId: itemBoxId,
  //      itemData: itemList,
  //    };

  //    const notification = makePacket(config.packetType.S_PLAYER_OPEN_BOX_RESPONSE, payload);
  //    //이 유저가 열고 있다는거 브로드캐스트

  //    room.broadcast(notification);
  //  }
  //테스트용 패킷

  const playerOpenBoxPayload = {
    playerId: userId,
    itemBoxId: 2,
    itemData: [],
  };

  const packet = [config.packetType.S_PLAYER_OPEN_BOX_NOTIFICATION, playerOpenBoxPayload];
  //이 유저가 열고 있다는거 브로드캐스트

  game.broadcast(packet);
};

export default playerOpenBoxHandler;
