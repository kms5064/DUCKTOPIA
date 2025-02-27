import { config } from '../../config/config.js';
import { gameSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';

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
