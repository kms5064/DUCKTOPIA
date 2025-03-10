import net from 'net';
import dns from 'dns';
import { loadProtos, getProtoMessages } from './0.src/init/loadProtos.js';
import { config } from './0.src/config/config.js';

// 더미 클라이언트

class Client {
  constructor(id, password, name, host, port) {
    this.id = id;
    this.password = password;
    this.name = name;
    this.socket = new net.Socket();
    this.buffer = Buffer.alloc(0);
    this.infos = {};
    this.interval = null;
    this.lastUpdated = 0;
    this.latency = [];
    this.address = null;

    dns.lookup(host, (err, address, family) => {
      if (err) {
        console.error(`DNS lookup failed: ${err.message}`);
        return;
      }
      this.address = address;
    });  

    // this.socket.connect(config.server.port, config.server.host, this.onConnection);
    this.socket.connect(this.address || port, host, this.onConnection);
    this.socket.on('error', this.onError);
    this.socket.on('data', this.onData);
  }

  onConnection = async () => {
    console.log(`${this.id} 연결 성공`);
  };

  onError = (err) => {
    console.error(err);
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
      if (this.buffer.length < headerLength + payloadByte) break;
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

        const now = Date.now();
        const latency = now - this.lastUpdated;
        this.latency.push(latency);
        const avg = Math.round(
          this.latency.reduce((acc, cur, idx, arr) => acc + cur / arr.length, 0),
        );

        console.log(
          `[패킷 수신] ${this.name}의 왕복시간 ${latency} ms / 평균 ${avg} ms / ${packetType}`,
        );

        switch (packetType) {
          case config.packetType.REGISTER_RESPONSE[0]:
            await this.loginRequest();
            break;
          case config.packetType.LOGIN_RESPONSE[0]:
            console;
            await this.createRoomRequest();
            break;
          case config.packetType.CREATE_ROOM_RESPONSE[0]:
            await this.prepareRequest();
            break;
          case config.packetType.PREPARE_GAME_NOTIFICATION[0]:
            this.interval = setInterval(this.moveUpdate, 200)
            break;
          case config.packetType.S_PLAYER_POSITION_UPDATE_NOTIFICATION[0]:
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
    this.lastUpdated = Date.now();
    this.socket.write(packet);
  }

  async end() {
    await this.delay(2000);
    clearInterval(this.interval);
    this.interval = null;
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
    this.sendPacket(config.packetType.PREPARE_GAME_REQUEST, {});
  }

  async gameStart(monsters, objects) {
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

  moveUpdate = async () => {
    console.log("보냄")
    const payload = {
      x: 5,
      y: 5,
    };
    this.sendPacket(config.packetType.C_PLAYER_POSITION_UPDATE_REQUEST, payload);
  };
}

// 테스트용 함수 모음
// 회원가입
const registerTest = async (client_count = 1) => {
  await Promise.all(
    Array.from({ length: client_count }, async (__, idx) => {
      const id = `dummy${idx}@email.com`;
      const password = '123456';
      const name = `dummy${idx}`;
      // const client = new Client(id, password, name, config.server.host, 5555);
      const client = new Client(id, password, name, '127.0.0.1', 5555);
      await client.registerRequest();
      // await client.end();
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
      const client = new Client(id, password, name, config.server.host, 5555);

      await client.loginRequest();
      // await client.end();
    }),
  );
};

// 커스텀
const customTest = async (client_count = 1) => {
  await Promise.all(
    Array.from({ length: client_count }, async (__, idx) => {
      const id = `dummy${1000 + idx}@email.com`;
      const password = '123456';
      const name = `dummy${1000 + idx}`;

      // Lobby 서버 연결
      const client = new Client(id, password, name, 'ducktopia-loadbalancer-1900b439129f13b9.elb.ap-northeast-2.amazonaws.com', 5555);
      // 로그인 이후 사용할 메서드 적용
      await client.loginRequest();
    }),
  );
};

// 테스트 실행문
await loadProtos().then(async () => {
  // await registerTest(300);
  await customTest(10);
});
