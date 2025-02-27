import { config } from '../../config/config';
import { gameSession } from '../../sessions/session';
import makePacket from '../../utils/packet/makePacket';

const latencyCheckHandler = ({ socket, payload, userId }) => {
  if (userId !== -1) return;
  let { errorMessage, timestamp } = payload;

  if (errorMessage === 'latencyCheck') errorMessage = gameSession.name;

  const packet = makePacket(
    config.packetType.S_ERROR_NOTIFICATION,
    { errorMessage, timestamp },
    userId,
  );

  socket.write(packet);
};

export default latencyCheckHandler;
