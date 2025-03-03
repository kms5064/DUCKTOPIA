import { getProtoMessages } from '../../init/loadProtos.js';

const latencyCheckHandler = ({ socket, payloadBuffer, userId }) => {
  const proto = getProtoMessages().GamePacket;
  const gamePacket = proto.decode(payloadBuffer);
  const payload = gamePacket[gamePacket.payload];

  if (userId !== -1) return;
  const { errorMessage, timestamp } = payload;
  const latency = Date.now() - timestamp;
  console.log(
    `###Latency### ${errorMessage} 와의 총 왕복 시간${latency}ms / 평균 Latency ${latency / 2}ms`,
  );
};

export default latencyCheckHandler;
