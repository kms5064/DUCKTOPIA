import { getProtoMessages } from '../../init/loadProtos.js';
import { userSession } from '../../sessions/session.js';

const latencyCheckHandler = ({ socket, payloadBuffer, userId }) => {
  const user = userSession.getUserByID(userId);
  if (user) return;

  const proto = getProtoMessages().GamePacket;
  const gamePacket = proto.decode(payloadBuffer);
  const payload = gamePacket[gamePacket.payload];

  const { errorMessage, timestamp } = payload;
  const latency = Date.now() - timestamp;
  // console.log(
  //   `###Latency### ${errorMessage} 와의 총 왕복 시간${latency}ms / 평균 Latency ${latency / 2}ms`,
  // );
};

export default latencyCheckHandler;
