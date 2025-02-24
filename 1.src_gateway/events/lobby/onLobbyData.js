import { config } from '../../config/config.js';
import handlers from '../../handlers/index.js';
import { getProtoMessages } from '../../init/loadProtos.js';
import { serverSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';
import { errorHandler } from '../../utils/error/errorHandler.js';
import makePacket from '../../utils/packet/makePacket.js';
import makeServerPacket from '../../utils/packet/makeServerPacket.js';

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

      // buffer의 길이가 충분한 동안 실행
      if (socket.buffer.length < headerLength + payloadByte) continue;
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

      const proto = getProtoMessages().GamePacket;
      const gamePacket = proto.decode(payloadBuffer);
      const payload = gamePacket[gamePacket.payload];

      const user = userSession.getUserByID(userId);
      if (!user) continue;

      if (packetType === config.packetType.PREPARE_GAME_SERVER[0]) {
        // 게임 상태 동기화
        for (const { name, userId: tempId } of payload.room.users) {
          const tempUser = userSession.getUserByID(tempId);
          tempUser.setGameState(payload.success);
        }

        if (payload.success) {
          const serverPayload = { room: payload.room };
          const reqPacket = makeServerPacket(
            config.packetType.JOIN_SERVER_REQUEST,
            serverPayload,
            user.id,
          );
          const gameServerSocket = serverSession.getServerById(config.server.gameServer);
          gameServerSocket.write(reqPacket);
        } else {
          throw CustomError('게임 시작 요청이 실패했습니다.');
        }
        continue;
      }

      // 클라이언트 패킷 전달
      const packetInfo = Object.values(config.packetType).find(
        ([type, name]) => type === packetType,
      );

      const resPacket = makePacket(packetInfo, payload);
      user.socket.write(resPacket);
    } catch (error) {
      errorHandler(socket, error);
    }
  }
};

export default onLobbyData;
