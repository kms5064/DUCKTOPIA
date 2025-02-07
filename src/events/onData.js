import { config } from '../config/config.js';
import handlers from '../handlers/index.js';
import { getProtoMessages } from '../init/loadProtos.js';

const onData = (socket) => async (data) => {
  console.log('📥 데이터 수신:', data);

  // 기존 버퍼에 새 데이터 추가
  socket.buffer = Buffer.concat([socket.buffer, data]);
  console.log('🔄 현재 버퍼 상태:', socket.buffer);

  const packetTypeByte = config.header.packetTypeByte; // 2바이트
  const versionLengthByte = config.header.versionLengthByte; // 1바이트
  const payloadLengthByte = config.header.payloadLengthByte; // 4바이트
  let versionByte = 0;
  let payloadByte = 0;
  const defaultLength = packetTypeByte + versionLengthByte;

  while (socket.buffer.length >= defaultLength) {
    console.log('✅ 패킷 처리 시작...');

    // 1️⃣ **패킷 최소 길이 검사 (패킷 타입 + 버전 길이)**
    if (socket.buffer.length < defaultLength + 1) {
      console.log(`⚠️ 패킷이 너무 짧음 (길이: ${socket.buffer.length})`);
      return;
    }

    // 2️⃣ **버전 길이 확인**
    versionByte = socket.buffer.readUInt8(packetTypeByte);
    console.log(`📌 버전 길이: ${versionByte} 바이트`);

    // 3️⃣ **전체 헤더 길이 확인**
    const headerLength = defaultLength + versionByte + payloadLengthByte;
    if (socket.buffer.length < headerLength) {
      console.log(`⚠️ 버퍼 부족. (현재: ${socket.buffer.length}, 필요: ${headerLength})`);
      return;
    }

    // 4️⃣ **페이로드 길이 확인 (4바이트)**
    payloadByte = socket.buffer.readUInt32BE(defaultLength + versionByte);
    console.log(`📌 페이로드 길이: ${payloadByte} 바이트`);

    // 5️⃣ **전체 패킷 길이 확인**
    if (socket.buffer.length < headerLength + payloadByte) {
      console.log(`⚠️ 전체 패킷이 아직 도착하지 않음. (현재: ${socket.buffer.length}, 필요: ${headerLength + payloadByte})`);
      return;
    }

    // 6️⃣ **패킷 데이터 추출**
    const packet = socket.buffer.subarray(0, headerLength + payloadByte);
    socket.buffer = socket.buffer.subarray(headerLength + payloadByte); // 남은 데이터 저장

    console.log('📥 패킷 데이터:', packet);
    console.log('🔄 남은 버퍼:', socket.buffer);

    // 7️⃣ **버전 문자열 추출**
    const version = packet.toString('utf8', defaultLength, defaultLength + versionByte);
    console.log('📌 패킷 버전:', version);

    // 버전 불일치 검증
    if (version !== config.client.version) {
      console.log(`⚠️ 버전 불일치! 수신된 버전: ${version} (기대: ${config.client.version})`);
      continue;
    }

    // 8️⃣ **패킷 타입 확인 (2바이트)**
    const packetType = packet.readUInt16BE(0);
    console.log('📌 패킷 타입:', packetType);

    // 9️⃣ **페이로드 데이터 추출**
    const payloadBuffer = packet.subarray(headerLength, headerLength + payloadByte);
    console.log('📌 페이로드 데이터:', payloadBuffer);

    // 1️⃣0️⃣ **페이로드 디코딩 & 핸들러 실행**
    try {
      const proto = getProtoMessages().GamePacket;
      const handler = handlers[packetType];

      if (!handler) {
        console.error(`❌ 해당 핸들러가 없음: ${packetType}`);
        continue;
      }

      const gamePacket = proto.decode(payloadBuffer);
      console.log('✅ 디코딩된 패킷:', gamePacket);

      const payload = gamePacket[gamePacket.payload];
      console.log('📦 페이로드:', payload);

      await handler({ socket, payload });
    } catch (e) {
      console.error('🚨 패킷 처리 오류:', e);
    }
  }
};

export default onData;
