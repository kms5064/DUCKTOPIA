import { config } from "../../config/config.js";
import { getProtoMessages } from "../../init/loadProtos.js";

function makePacket (packetType, payload) {
    const proto = getProtoMessages();
    let message = null;
    let payloadBuffer = null;

    try {
        message = proto[packetType].create(payload);
        payloadBuffer = proto[packetType].encode(message).finish();
    } catch (e) {
        console.error(e);
    }

    const packetTypeBuffer = Buffer.alloc(config.header.packetTypeByte);
    packetTypeBuffer.writeUInt16BE(packetType);

    const versionBuffer = Buffer.from(config.client.version);

    const versionLengthBuffer = Buffer.alloc(config.header.versionLengthByte);
    versionLengthBuffer.writeUInt8(versionBuffer.length);

    const payloadLengthBuffer = Buffer.alloc(config.header.payloadLengthByte);
    payloadLength.writeUInt32BE(payloadBuffer.length);

    const packet = Buffer.concat(packetTypeBuffer, [version, versionLength, payloadLengthBuffer, payloadBuffer]);
    return packet;
}

export default makePacket;