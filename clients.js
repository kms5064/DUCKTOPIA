import net from 'net';
import { loadProtos, getProtoMessages } from './src/init/loadProtos.js';
import { config } from '.src/config/config.js';

// 더미 클라이언트

let gameServerPacket;
let monsters;

class Client {
  constructor(id, password, name, host, port) {
    this.id = id;
    this.password = password;
    this.name = name;
    this.socket = new net.Socket();
    this.buffer = Buffer.alloc(0);
    this.infos = {};

    // this.socket.connect(config.server.port, config.server.host, this.onConnection);
    this.socket.connect(port, host, this.onConnection);
    this.socket.on('data', this.onData);
  }

  onConnection = async () => {
    console.log(`${this.id} 연결 성공`);
  };

  // 패킷 수신
  onData = async (data) => {
    this.buffer = Buffer.concat([this.buffer, data]);
    const packetTypeByte = config.header.packetTypeByte;
    const versionLengthByte = config.header.versionLengthByte;
    let versionByte = 0;
    const payloadLengthByte = config.header.payloadLengthByte;
    let payloadByte = 0;
    const defaultLength = packetTypeByte + versionLengthByte;

    while (this.buffer.length >= defaultLength) {
      // 가변 길이 확인
      versionByte = this.buffer.readUInt8(packetTypeByte);
      payloadByte = this.buffer.readUInt32BE(defaultLength + versionByte);
      const headerLength = defaultLength + versionByte + payloadLengthByte;
      // buffer의 길이가 충분한 동안 실행
      if (this.buffer.length < headerLength + payloadByte) continue;
      // 패킷 분리
      const packet = this.buffer.subarray(0, headerLength + payloadByte);
      // 남은 패킷 buffer 재할당
      this.buffer = this.buffer.subarray(headerLength + payloadByte);

      // 값 추출 및 버전 검증
      const version = packet.toString('utf8', defaultLength, defaultLength + versionByte);
      if (version !== config.client.version) continue;
      const packetType = packet.readUInt16BE(0);
      const payloadBuffer = packet.subarray(headerLength, headerLength + payloadByte);
      try {
        const proto = getProtoMessages().GamePacket;
        const gamePacket = proto.decode(payloadBuffer);
        const payload = gamePacket[gamePacket.payload];

        console.log('패킷 수신', packetType, payload);
        switch (packetType) {
          case config.packetType.LOGIN_RESPONSE[0]:
            // await this.createRoomRequest();
            break;
          case config.packetType.GAME_INFOS_REQUEST[0]:
            monsters = payload.monsters;
            monsters.forEach((monster) => {
              monster.x = 5;
              monster.y = 10;
            });
            await this.gameStart(monsters, payload.objects);
            break;
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // 패킷 송신
  sendPacket([packetType, packetTypeName], payload) {
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
    this.socket.write(packet);
  }

  async end() {
    await this.delay(2000);
    this.socket.end();
  }

  async delay(time) {
    return new Promise((resolve) => setTimeout(() => resolve(), time));
  }

  // 요청 메서드 모음

  async registerRequest() {
    const payload = { email: this.id, password: this.password, nickname: this.name };
    this.sendPacket(config.packetType.REGISTER_REQUEST, payload);
  }

  async loginRequest() {
    const payload = { email: this.id, password: this.password };
    this.sendPacket(config.packetType.LOGIN_REQUEST, payload);
  }

  async createRoomRequest() {
    const payload = { roomName: this.id, maxUserNum: 2 };
    this.sendPacket(config.packetType.CREATE_ROOM_REQUEST, payload);
  }

  async prepareRequest() {
    const payload = {};
    this.sendPacket(config.packetType.PREPARE_GAME_REQUEST, payload);
  }

  async gameStart(monsters, objects) {
    console.log('#5');
    const payload = { monsters, objects };
    this.sendPacket(config.packetType.START_GAME_REQUEST, payload);
  }

  async joinRequest() {
    // playerId 어떻게 가져올까요???
    const payload = {
      playerId: 100,
      redisKey: gameServerPacket.redisKey,
      token: gameServerPacket.token,
    };
    this.sendPacket(config.packetType.JOIN_SERVER_REQUEST, payload);
  }
}

// 테스트용 함수 모음
// 회원가입
const registerTest = async (client_count = 1) => {
  await Promise.all(
    Array.from({ length: client_count }, async (__, idx) => {
      const id = `dummy${idx}@email.com`;
      const password = '123456';
      const name = `dummy${idx}`;
      const client = new Client(id, password, name, config.server.host, 5556);

      await client.registerRequest();
      await client.end();
    }),
  );
};

// 로그인
const loginTest = async (client_count = 1) => {
  await Promise.all(
    Array.from({ length: client_count }, async (__, idx) => {
      const id = `dummy${idx}@email.com`;
      const password = '123456';
      const name = `dummy${idx}`;
      const client = new Client(id, password, name, config.server.host, 5556);

      await client.loginRequest();
      await client.end();
    }),
  );
};

// 커스텀
const customTest = async (client_count = 1) => {
  await Promise.all(
    Array.from({ length: client_count }, async (__, idx) => {
      const id = `dummy${idx}@email.com`;
      const password = '123456';
      const name = `dummy${idx}`;

      // Lobby 서버 연결
      const client = new Client(id, password, name, '127.0.0.1', 5556);

      // 로그인 이후 사용할 메서드 적용
      console.log('#1');
      await client.loginRequest();
      await client.delay(1000);
      console.log('#2');
      await client.createRoomRequest();
      await client.delay(1000);
      console.log('#3');
      await client.prepareRequest();
      console.log('#4');
      // await client.gameStart();
      // await client.end();
      // await gameClient.joinRequest();
    }),
  );
};

// 테스트 실행문
await loadProtos().then(() => {
  // registerTest(10);
  customTest(1);
});
