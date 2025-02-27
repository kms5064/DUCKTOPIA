import { config } from "../../config/config.js";
import makePacket from "../../utils/packet/makePacket.js";

const latencyCheckHandler = ({ socket, payload, userId }) => {
  if (userId !== -1) {
    const packet = makePacket(config.packetType.S_ERROR_NOTIFICATION, payload)
    socket.write(packet)
  } else {
    const { errorMessage, timestamp } = payload;
    const latency = Date.now() - timestamp;
    console.log(
      `###Latency### ${errorMessage} 와의 총 왕복 시간${latency}ms / 평균 Latency ${latency / 2}ms`,
    );
  }
};

export default latencyCheckHandler;
