import Game from '../../class/game/game.class.js';
import Player from '../../class/player/player.class.js';
import { PACKET_TYPE } from '../../config/constants/header.js';
import { userSession } from '../../sessions/session.js';

// const gamePrepareReqHandler = (room) => {
//   try {
//     const game = new Game(room.uuid); //room의 uuid 따라가기

//     room.users.forEach((user) => {
//       const player = new Player(id, x, y, user);
//       game.addPlayer(player);
//     });

//     //map정보 넣기
//     //base좌표 넣기

//     const payload = {
//       S2CGamePrepareResponse: {
//         success,
//       },
//     };

//     const message = dataType.create(payload);
//     const S2CGamePrepareResponse = dataType.encode(message).finish();

//     const notification = payloadParser(S2CGamePrepareResponse);

//     game.players.forEach((player) => {
//       player.socket.write(notification);
//     });
//   } catch (err) {
//     console.error(err);
//   }
// };

// export default gamePrepareReqHandler;

const startGameHandler = ({socket, payload}) => {
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

    //아직 미완입니다!

  } catch (err) {

  }
}