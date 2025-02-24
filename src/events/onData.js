import { config } from '../config/config.js';
import handlers from '../handlers/index.js';
import { getProtoMessages } from '../init/loadProtos.js';
import { errorHandler } from '../utils/error/errorHandler.js';
import onEnd from './onEnd.js';

const onData = (socket) => async (data) => {

  socket.buffer = Buffer.concat([socket.buffer, data]);
  const packetTypeByte = config.header.packetTypeByte;
  const versionLengthByte = config.header.versionLengthByte;
  let versionByte = 0;
  const payloadLengthByte = config.header.payloadLengthByte;
  let payloadByte = 0;
  const defaultLength = packetTypeByte + versionLengthByte;

  while (socket.buffer.length >= defaultLength) {
    try {
      // 가변 길이 확인
      try {
        versionByte = socket.buffer.readUInt8(packetTypeByte);
        payloadByte = socket.buffer.readUInt32BE(defaultLength + versionByte);
      } catch (err) {
        console.error('잘못된 요청 제거');
        socket.buffer = Buffer.alloc(0);
        onEnd(socket)();
      }
      const headerLength = defaultLength + versionByte + payloadLengthByte;

      // buffer의 길이가 충분한 동안 실행
      if (socket.buffer.length < headerLength + payloadByte) continue;
      const packet = socket.buffer.subarray(0, headerLength + payloadByte);
      // 남은 패킷 buffer 재할당
      socket.buffer = socket.buffer.subarray(headerLength + payloadByte);

      // 값 추출 및 버전 검증
      const version = packet.toString('utf8', defaultLength, defaultLength + versionByte);
      if (version !== config.client.version) {
        console.error('형식 오류 요청 제거');
        socket.buffer = Buffer.alloc(0);
        onEnd(socket)();
        break;
      }
      const packetType = packet.readUInt16BE(0);
      const payloadBuffer = packet.subarray(headerLength, headerLength + payloadByte);

      const proto = getProtoMessages().GamePacket;
      console.log(packetType);
      const handler = handlers[packetType];
      const gamePacket = proto.decode(payloadBuffer);
      const payload = gamePacket[gamePacket.payload];

      await handler({ socket, payload });
    } catch (error) {
      errorHandler(socket, error);
    }
  }
};

export default onData;
