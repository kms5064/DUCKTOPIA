import { PACKET_TYPE } from '../../config/constants/header.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';

const gameStartHandler = ({socket, payload}) => {
  try {
    const user = userSession.getUser(socket);

    const room = roomSession.getRoom(user.roomId);
    
    if (!room) {
      throw new Error('방 생성에 실패했습니다!');
    }
    
    
    const GameStartNotification = makePacket(PACKET_TYPE.START_GAME_NOTIFICATION,{
      gameState: { phaseType: 1, nextPhaseAt: 100000 },
      users: room.getUsersData(),
      characterPositions: room.getUsersPositionData()
    });

    room.joinUserNotification(GameStartNotification);

  } catch (err) {
    console.error(err);
  }
};

export default gameStartHandler;
