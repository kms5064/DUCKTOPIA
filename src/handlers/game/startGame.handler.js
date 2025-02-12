import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';

const gameStartHandler = ({socket, payload}) => {
  try {
    const user = userSession.getUser(socket);
    const room = roomSession.getRoom(user.roomId);
    const game = room.game;
    

    if(!room) {
      throw new Error('방 생성에 실패했습니다!');
    }
    
    const GameStartNotification = makePacket(PACKET_TYPE.START_GAME_NOTIFICATION, {
      gameState: { phaseType: 1, nextPhaseAt: 100000 }, //이삭님 코드에 이렇게돼있음!
      users: room.getUserData(),
      characterPositions: room.getUsersPositionData()
    })


    



    room.startGame();
    room.broadcast(GameStartNotification);
  } catch (err) {

  }
};

export default gameStartHandler;