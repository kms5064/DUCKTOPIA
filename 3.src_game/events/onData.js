import { config } from '../config/config.js';
import handlers from '../handlers/index.js';
import { getProtoMessages } from '../init/loadProtos.js';
import { errorHandler } from '../utils/error/errorHandler.js';
import { formatDate } from '../utils/dateFormatter.js';

const onData = (socket) => async (data) => {
  // console.log(`${formatDate(new Date())} [게이트웨이 -> 게임] 데이터 수신`);

  socket.buffer = Buffer.concat([socket.buffer, data]);
  const packetTypeByte = config.header.packetTypeByte;
  const versionLengthByte = config.header.versionLengthByte;
  let versionByte = 0;
  const payloadLengthByte = config.header.payloadLengthByte;
  let userIdByte = 0;
  const userIdLengthByte = config.header.userIdLengthByte;
  let payloadByte = 0;
  const defaultLength = packetTypeByte + versionLengthByte;
  while (socket.buffer.length >= defaultLength) {
    try {
      // 가변 길이 확인
      // versionLength를 읽음
      versionByte = socket.buffer.readUInt8(packetTypeByte);
      // userIdLength를 읽음
      userIdByte = socket.buffer.readUInt8(defaultLength + versionByte);
      // payloadLength를 읽음
      payloadByte = socket.buffer.readUInt32BE(
        defaultLength + versionByte + userIdLengthByte + userIdByte,
      );
      const headerLength =
        defaultLength + versionByte + userIdLengthByte + userIdByte + payloadLengthByte;
      // buffer의 길이가 충분한 동안 실행
      if (socket.buffer.length < headerLength + payloadByte) break;
      const packet = socket.buffer.subarray(0, headerLength + payloadByte);
      // 남은 패킷 buffer 재할당
      socket.buffer = socket.buffer.subarray(headerLength + payloadByte);
      // 값 추출 및 버전 검증
      const version = packet.toString('utf8', defaultLength, defaultLength + versionByte);
      if (version !== config.client.version) break;
      const userId = +packet.toString(
        'utf8',
        defaultLength + versionByte + userIdLengthByte,
        defaultLength + versionByte + userIdLengthByte + userIdByte,
      );

      const packetType = packet.readUInt16BE(0);
      const payloadBuffer = packet.subarray(headerLength, headerLength + payloadByte);
      const proto = getProtoMessages().GamePacket;
      const handler = handlers[packetType];
      const gamePacket = proto.decode(payloadBuffer);
      const payload = gamePacket[gamePacket.payload];
      console.log(packetType);
      await handler({ socket, payload, userId });
    } catch (error) {
      errorHandler(socket, error);
    }
  }
};

export default onData;
