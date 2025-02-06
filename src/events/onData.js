import { getProtoMessages } from "../init/loadProtos.js";

const onData = (socket) => (data) => {
    console.log('데이터 수신');

    socket.buffer = Buffer.concat([socket.buffer, data]);
    const packetTypeByte = config.header.packetTypeByte;
    const versionLengthByte = config.header.versionLengthByte;
    let versionByte = 0;
    const payloadLengthByte = config.header.payloadLengthByte;
    let payloadByte = 0;
    const defaultLength = packetTypeByte + versionLengthByte
    
    while (socket.buffer.length >= defaultLength) {
        // 가변 길이 확인
        versionByte = socket.buffer.readUInt8(defaultLength);
        payloadByte = socket.buffer.readUInt32BE(defaultLength + versionByte);
        // buffer의 길이가 충분한 동안 실행
        if (socket.buffer.length < defaultLength + versionByte + payloadByte) break
        // 패킷 분리
        const packet = socket.buffer.subarray(0, defaultLength + versionByte + payloadByte);
        // 남은 패킷 buffer 재할당
        socket.buffer = socket.buffer.subarray(defaultLength + versionByte + payloadByte);

        // 값 추출 및 검증
        const version = packet.toString('utf8', defaultLength, defaultLength + versionByte);
        if (version !== config.client.version) break;
        const packetType = packet.readUInt16BE(0);
        const payloadBuffer = packet.subarray(defaultLength + versionByte + payloadLengthByte, defaultLength + versionByte + payloadLengthByte + payloadByte)
        
        try {
            const proto = getProtoMessages();
            const payload = proto[packetType].decode(payloadBuffer);
            // 핸들러 기입 예정, 맵핑 있으면 편할 듯

        } catch (e){
            console.error(e);
        }
        
    }

};

export default onData;