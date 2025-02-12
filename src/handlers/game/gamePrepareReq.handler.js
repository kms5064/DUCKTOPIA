import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';

const gamePrepareReqHandler = ({ socket, payload }) => {
  try {
    const user = userSession.getUser(socket.id);
    const room = roomSession.getRoom(user.roomId);
    if (!room) {
      throw new Error('방 생성에 실패했습니다!');
    }

    const game = room.getGame();
    if (!game) {
      throw new Error('게임 생성에 실패했습니다!');
    }

    // 초기 몬스터 정보 생성
    const monsterData = game.createMonsterData();

    const GamePrepareResponse = makePacket(config.packetType.PREPARE_GAME_RESPONSE, {
      success: true,
      monsterData,
      objectData: [],
    });
    socket.write(GamePrepareResponse);

    const GamePrepareNotification = makePacket(config.packetType.PREPARE_GAME_NOTIFICATION, {
      room: room.getRoomData(),
    });

    room.broadcast(GamePrepareNotification);
  } catch (err) {
    console.error(err);
  }
};

export default gamePrepareReqHandler;
