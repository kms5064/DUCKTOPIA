import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';

const gameStartHandler = ({ socket, payload }) => {
  try {
    const { monsters, objects } = payload;

    const user = userSession.getUser(socket.id);
    const room = roomSession.getRoom(user.roomId);

    if (!room) {
      throw new Error('방 생성에 실패했습니다!');
    }

    const game = room.getGame();
    if (!game) {
      throw new Error('게임 생성에 실패했습니다!');
    }

    // 몬스터 : 클라에서 생성된 좌표 값으로 변경
    monsters.forEach((monster) => {
      game.updateMonsterPosition(monster.monsterId, monster.x, monster.y);
    });

    const GameStartNotification = makePacket(config.packetType.START_GAME_NOTIFICATION, {
      gameState: { phaseType: 0, nextPhaseAt: 100000 }, //이삭님 코드에 이렇게돼있음!
      playerPositions: room.getUsersPositionData(),
    });

    room.startGame();
    room.broadcast(GameStartNotification);
  } catch (err) {
    console.log(err)
  }
};

export default gameStartHandler;
