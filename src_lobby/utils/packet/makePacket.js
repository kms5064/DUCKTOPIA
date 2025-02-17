import { config } from '../../config/config.js';
import { getProtoMessages } from '../../init/loadProtos.js';

function makePacket([packetType, packetTypeName], payload) {
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

  const payloadLengthBuffer = Buffer.alloc(4);
  payloadLengthBuffer.writeUInt32BE(payloadBuffer.length);

  const packet = Buffer.concat([
    packetTypeBuffer,
    versionLengthBuffer,
    versionBuffer,
    payloadLengthBuffer,
    payloadBuffer,
  ]);
  return packet;
}

export default makePacket;
