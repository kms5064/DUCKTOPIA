import { config } from '../config/config.js';
import handlers from '../handlers/index.js';
import { getProtoMessages } from '../init/loadProtos.js';
import { serverSession } from '../sessions/session.js';
import { errorHandler } from '../utils/error/errorHandler.js';

const onData = (socket) => async (data) => {
  //console.log('데이터 수신');

  socket.buffer = Buffer.concat([socket.buffer, data]);
  const packetTypeByte = config.header.packetTypeByte;
  const versionLengthByte = config.header.versionLengthByte;
  let versionByte = 0;
  const payloadLengthByte = config.header.payloadLengthByte;
  let payloadByte = 0;
  const defaultLength = packetTypeByte + versionLengthByte;
  let sendBuffer;
  let packetType;
  try {
    while (socket.buffer.length >= defaultLength) {
      // 가변 길이 확인
      versionByte = socket.buffer.readUInt8(packetTypeByte);
      payloadByte = socket.buffer.readUInt32BE(defaultLength + versionByte);
      const headerLength = defaultLength + versionByte + payloadLengthByte;

      // buffer의 길이가 충분한 동안 실행
      if (socket.buffer.length < headerLength + payloadByte) continue;

      // 해당 서버로 보낼 버퍼를 그대로 복사
      sendBuffer = socket.buffer;

      const packet = socket.buffer.subarray(0, headerLength + payloadByte);
      // 남은 패킷 buffer 재할당
      socket.buffer = socket.buffer.subarray(headerLength + payloadByte);

      // 값 추출 및 버전 검증
      const version = packet.toString('utf8', defaultLength, defaultLength + versionByte);
      if (version !== config.client.version) continue;
      packetType = packet.readUInt16BE(0);
      const payloadBuffer = packet.subarray(headerLength, headerLength + payloadByte);

      const proto = getProtoMessages().GamePacket;
      // const handler = handlers[packetType];
      const gamePacket = proto.decode(payloadBuffer);
      const payload = gamePacket[gamePacket.payload];

      // TODO : 페이로드 검증할거 있으면 추가
    }

    const serverSocket = serverSession.getServerById(handlers[packetType]);
    const res = await serverSocket.write(sendBuffer);
  } catch (error) {
    errorHandler(socket, error);
  }
};

export default onData;
