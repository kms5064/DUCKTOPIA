import { PACKET_TYPE } from '../../config/constants/header.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';

const gamePrepareReqHandler = ({socket, payload}) => {
  try {

    const user = userSession.getUser(socket);
    const room = roomSession.getRoom(user.roomId);
    

    const GamePrepareResponse = makePacket(PACKET_TYPE.PREPARE_GAME_RESPONSE,{
      success: false
    });
    socket.write(GamePrepareResponse)

    const GamePrepareNotification = makePacket(PACKET_TYPE.PREPARE_GAME_NOTIFICATION,{
      room: room.getRoomData()
    });

    room.joinUserNotification(GamePrepareNotification);

  } catch (err) {
    console.error(err);
  }
};

export default gamePrepareReqHandler;