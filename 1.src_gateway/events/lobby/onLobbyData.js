import { config } from '../../config/config.js';
import gameStartHandler from '../../handlers/server/gameStart.handler.js';
import latencyCheckHandler from '../../handlers/server/latencyCheck.handler.js';
import { getProtoMessages } from '../../init/loadProtos.js';
import { userSession } from '../../sessions/session.js';
import { errorHandler } from '../../utils/error/errorHandler.js';
import makePacket from '../../utils/packet/makePacket.js';

const onLobbyData = (socket) => async (data) => {
  // console.log('로비서버 데이터 수신');

  socket.buffer = Buffer.concat([socket.buffer, data]);
  const packetTypeByte = config.header.packetTypeByte;
  const versionLengthByte = config.header.versionLengthByte;
  let versionByte = 0;
  const payloadLengthByte = config.header.payloadLengthByte;
  let payloadByte = 0;
  const userIdLengthByte = config.header.userIdLengthByte;
  let userIdByte = 0;
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

      // buffer의 길이가 충분한 동안 실행 > 분할
      if (socket.buffer.length < headerLength + payloadByte) break;
      const packet = socket.buffer.subarray(0, headerLength + payloadByte);
      // 남은 패킷 buffer 재할당
      socket.buffer = socket.buffer.subarray(headerLength + payloadByte);

      // 값 추출 및 버전 검증
      const version = packet.toString('utf8', defaultLength, defaultLength + versionByte);
      if (version !== config.client.version) continue;

      const userId = +packet.toString(
        'utf8',
        defaultLength + versionByte + userIdLengthByte,
        defaultLength + versionByte + userIdLengthByte + userIdByte,
      );

      const packetType = packet.readUInt16BE(0);
      const payloadBuffer = packet.subarray(headerLength, headerLength + payloadByte);

      // const proto = getProtoMessages().GamePacket;
      // const gamePacket = proto.decode(payloadBuffer);
      // const payload = gamePacket[gamePacket.payload];

      if (packetType === config.packetType.PREPARE_GAME_SERVER[0]) {
        gameStartHandler({ socket, payloadBuffer, userId });
        // 서버 -> 서버 이므로 클라이언트에게 전송 X
        continue;
      }

      if (packetType === config.packetType.S_ERROR_NOTIFICATION[0]) {
        latencyCheckHandler({ socket, payloadBuffer, userId });
        continue;
      }

      // 클라이언트 패킷 전달
      const packetInfo = Object.values(config.packetType).find(
        ([type, name]) => type === packetType,
      );

      const user = userSession.getUserByID(userId);
      if (!user) continue;

      const resPacket = makePacket(packetInfo, null, payloadBuffer);
      user.socket.write(resPacket);
    } catch (error) {
      errorHandler(socket, error);
    }
  }
};

export default onLobbyData;
