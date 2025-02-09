import { getProtoMessages } from '../../init/loadProtos.js';
import { config } from '../../config/config.js';
import { PACKET_TYPE } from '../../config/constants/header.js';

/**
 * 클라이언트에 전송할 응답 패킷을 생성합니다.
 * 패킷 구조:
 * [PacketType(2)][VersionLength(1)][Version(Variable)][PayloadLength(4)][Payload(Variable)]
 * @param {number} handlerId - 핸들러 ID
 * @param {number} responseCode - 응답 코드 (ErrorCodes에 정의된 코드)
 * @param {Object|null} data - 전송할 데이터 (선택사항)
 * @param {string|null} message - 에러 메시지 (선택사항)
 * @returns {Buffer} - 생성된 응답 패킷
 */

export const createResponse = (handlerId, responseCode, data = null, message = null) => {
  // 프로토버프 응답 페이로드 생성
  const Response = getProtoMessages().response.Response;
  const responsePayload = {
    handlerId,
    responseCode,
    timestamp: Date.now(),
    data: data ? Buffer.from(JSON.stringify(data)) : null,
    message: message || null,
  };

  // Payload 생성
  const payloadBuffer = Response.encode(responsePayload).finish();

  // 버전 정보
  const version = Buffer.from(config.client.version);
  const versionLength = version.length;

  // PacketType (2바이트)
  const packetType = Buffer.alloc(config.header.packetTypeByte);
  // handlerId에 해당하는 PACKET_TYPE의 첫번째 요소(코드값)를 사용
  const packetTypeCode =
    Object.values(PACKET_TYPE).find(([code, name]) => code === handlerId)?.[0] || 0;
  packetType.writeUInt16BE(packetTypeCode, 0);

  // VersionLength (1바이트)
  const versionLengthBuffer = Buffer.alloc(config.header.versionLengthByte);
  versionLengthBuffer.writeUInt8(versionLength);

  // PayloadLength (4바이트)
  const payloadLength = Buffer.alloc(config.header.payloadLengthByte);
  payloadLength.writeUInt32BE(payloadBuffer.length);

  // 패킷 조립
  return Buffer.concat([packetType, versionLengthBuffer, version, payloadLength, payloadBuffer]);
};
