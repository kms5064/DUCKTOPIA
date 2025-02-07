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

  console.log(`📦 [${packetTypeName}] Payload Buffer Length: ${payloadBuffer.length}`);

  // header 생성
  const packetTypeBuffer = Buffer.alloc(2);
  packetTypeBuffer.writeUInt16BE(packetType);
  console.log(`📝 Packet Type Buffer Length: ${packetTypeBuffer.length}`);

  const versionBuffer = Buffer.from(config.client.version);
  console.log(`🔢 Version Buffer Length: ${versionBuffer.length}`);

  const versionLengthBuffer = Buffer.alloc(1);
  versionLengthBuffer.writeUInt8(versionBuffer.length);
  console.log(`📏 Version Length Buffer Length: ${versionLengthBuffer.length}`);

  const payloadLengthBuffer = Buffer.alloc(4);
  payloadLengthBuffer.writeUInt32BE(payloadBuffer.length);
  console.log(`📦 Payload Length Buffer Length: ${payloadLengthBuffer.length}`);

  const packet = Buffer.concat([
    packetTypeBuffer,
    versionLengthBuffer,
    versionBuffer,
    payloadLengthBuffer,
    payloadBuffer,
  ]);

  console.log(`📏 Total Packet Length: ${packet.length}`);

  return packet;
}

export default makePacket;