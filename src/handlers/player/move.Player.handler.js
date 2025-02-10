import { PACKET_TYPE } from "../../config/constants/header.js";
import { roomSession, userSession } from "../../sessions/session.js";
import makePacket from "../../utils/packet/makePacket.js";



const movePlayerHandler = async ({socket, payload}) => {
    const {x, y} = payload;

    const user = userSession.getUser(socket);
    user.posiup(x,y);
    const room = roomSession.getRoom(user.roomId);
    
    const PositionUpdateNotification = makePacket(PACKET_TYPE.PLAYER_UPDATE_POSITION_NOTIFICATION,{
        characterPositions : room.getPositionUpdateNotification()
      });
  
      room.joinUserNotification(PositionUpdateNotification);
    
}

export default movePlayerHandler;