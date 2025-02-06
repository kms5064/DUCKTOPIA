import net from 'net';
import { loadProtos,getProtoMessages } from './src/init/loadProto.js';

const configVersion = "1.0.0"

class Client {
    constructor(id, password) {
        this.id = id;
        this.password = password;
        this.socket = new net.Socket();
        this.buffer = Buffer.alloc(0);

        this.socket.connect(5555, 'localhost', this.onConnection);
        this.socket.on('data', this.onData);
    }

    onConnection = async () => {
        console.log("연결 성공")
    }

    onData = async (data) => {
        try {
            this.buffer = Buffer.concat([this.buffer, data]);
            const packetTypeByte = 2;
            const versionLengthByte = 1;
            let versionByte = 0;
            const payloadLengthByte = 4;
            let payloadByte = 0;
            const defaultLength = packetTypeByte + versionLengthByte
            
            while (this.buffer.length >= defaultLength) {
                // 가변 길이 확인
                versionByte = this.buffer.readUInt8(defaultLength);
                payloadByte = this.buffer.readUInt32BE(defaultLength + versionByte);
                // buffer의 길이가 충분한 동안 실행
                if (this.buffer.length < defaultLength + versionByte + payloadByte) break
                // 패킷 분리
                const packet = this.buffer.subarray(0, defaultLength + versionByte + payloadByte);
                // 남은 패킷 buffer 재할당
                this.buffer = this.buffer.subarray(defaultLength + versionByte + payloadByte);

                // 값 추출 및 검증
                const version = packet.toString('utf8', defaultLength, defaultLength + versionByte);
                if (version !== configVersion) break;
                const packetType = packet.readUInt16BE(0);
                const payloadBuffer = packet.subarray(defaultLength + versionByte + payloadLengthByte, defaultLength + versionByte + payloadLengthByte + payloadByte)
                
                const payload = this.parsePacket(packetType, payloadBuffer);
                console.log(payload)
            }
        } catch (e){
            console.error(e);
        }
    }

    parsePacket(packetType, payloadBuffer) {
        const proto = getProtoMessages();
        let payload = null;
        try {
            payload = proto[packetType].decode(payloadBuffer);
        }catch(e){
            console.error(e);
        }
        return payload;
    }

    makePacket(packetType, payload) {
        const proto = getProtoMessages();
        let message = null;
        let payloadBuffer = null;

        try {
            message = proto[packetType].create(payload);
            payloadBuffer = proto[packetType].encode(message).finish();
        } catch (e) {
            console.error(e);
        }

        const packetTypeBuffer = Buffer.alloc(2);
        packetTypeBuffer.writeUInt16BE(packetType);

        const versionBuffer = Buffer.from(configVersion);

        const versionLengthBuffer = Buffer.alloc(1);
        versionLengthBuffer.writeUInt8(versionBuffer.length);

        const payloadLengthBuffer = Buffer.alloc(4);
        payloadLength.writeUInt32BE(payloadBuffer.length);

        const packet = Buffer.concat(packetTypeBuffer, [version, versionLength, payloadLengthBuffer, payloadBuffer]);
        return packet;
    }
}

await loadProtos().then(() => {
    const client = new Client('test', '1234');
});


