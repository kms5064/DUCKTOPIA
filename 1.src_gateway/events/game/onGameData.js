import { config } from '../../config/config.js';
import { userSession } from '../../sessions/session.js';
import latencyCheckHandler from '../../handlers/server/latencyCheck.handler.js';

const onGameData = (socket) => async (data) => {
  // console.log('게임서버 데이터 수신');
  // console.time('check');

  socket.buffer = Buffer.concat([socket.buffer, data]);
  const packetTypeByte = config.header.packetTypeByte;
  const versionLengthByte = config.header.versionLengthByte;
  let versionByte = 0;
  const payloadLengthByte = config.header.payloadLengthByte;
  let payloadByte = 0;
  const userIdLengthByte = config.header.userIdLengthByte;
  let userIdByte = 0;
  const defaultLength = packetTypeByte + versionLengthByte;

  try {
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
      } catch (err) {
        break;
      }
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

      if (packetType === config.packetType.S_ERROR_NOTIFICATION[0])
        latencyCheckHandler({ socket, payloadBuffer, userId });

      const user = userSession.getUserByID(userId);
      if (!user) continue;

      const header = packet.subarray(
        0,
        headerLength - (userIdLengthByte + userIdByte + payloadLengthByte),
      );
      const payload = packet.subarray(headerLength - payloadLengthByte);
      const resPacket = Buffer.concat([header, payload]);

      user.socket.write(resPacket);
      // console.log('클라이언트 연결');
      // console.timeEnd('check');
    }
  } catch (error) {
    console.error(error);
  }
};

export default onGameData;
