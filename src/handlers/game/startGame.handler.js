// import Game from '../../class/game/game.class.js';
// import Player from '../../class/player/player.class.js';
import { PACKET_TYPE } from '../../config/constants/header.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';

//3004 : 게임 시작
const gameStartHandler = ({socket, payload}) => {
  try {
    const user = userSession.getUser(socket);
    const room = roomSession.getRoom(user.roomId);

    if(!room) {
      throw new Error('방 생성에 실패했습니다!');
    }
    
    const GameStartNotification = makePacket(PACKET_TYPE.START_GAME_NOTIFICATION, {
      gameState: { phaseType: 1, nextPhaseAt: 100000 }, //이삭님 코드에 이렇게돼있음!
      users: room.getUsersData(),
      characterPositions: room.getUsersPositionData()
    })


    



    room.joinUserNotification(GameStartNotification);

    console.log('Game Start!');

    room.startGame();

  } catch (err) {

  }
};

export default gameStartHandler;