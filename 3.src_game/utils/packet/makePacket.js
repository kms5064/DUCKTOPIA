import { config } from '../../config/config.js';
import { getProtoMessages } from '../../init/loadProtos.js';

function makePacket([packetType, packetTypeName], payload, userId) {
  const proto = getProtoMessages().GamePacket;
  let message = null;
  let payloadBuffer = null;

  // payload 생성
  try {
    message = proto.create({ [packetTypeName]: payload });
    payloadBuffer = proto.encode(message).finish();
  } catch (e) {
    console.error(e);
  }

  // header 생성
  const packetTypeBuffer = Buffer.alloc(2);
  packetTypeBuffer.writeUInt16BE(packetType);

  const versionBuffer = Buffer.from(config.client.version);

  const versionLengthBuffer = Buffer.alloc(1);
  versionLengthBuffer.writeUInt8(versionBuffer.length);

  const userIdBuffer = Buffer.from('' + userId);

  const userIdLengthBuffer = Buffer.alloc(1);
  userIdLengthBuffer.writeUInt8(userIdBuffer.length);

  const payloadLengthBuffer = Buffer.alloc(4);
  payloadLengthBuffer.writeUInt32BE(payloadBuffer.length);

  const packet = Buffer.concat([
    packetTypeBuffer,
    versionLengthBuffer,
    versionBuffer,
    userIdLengthBuffer,
    userIdBuffer,
    payloadLengthBuffer,
    payloadBuffer,
  ]);
  return packet;
}

export default makePacket;
