import net from 'net';
import { loadProtos } from './init/load.proto.js';

const onConnection = async (socket) => {
    console.log(`클라이언트 접속: ${socket.remoteAddress}:${socket.remotePort}`);
    socket.on('data', (data) => {
        console.log(`클라이언트 데이터: ${data}`);
    });
    socket.on('end', () => {
        console.log(`클라이언트 접속 종료`);
    });
    socket.on('error', (error) => {
        console.error(`에러: ${error}`);
    });
}

/* 서버 생성 */
const server = net.createServer(onConnection);

// [2] 서버 LISTEN 상태로 변경
await loadProtos().then(() => {
    server.listen(5555, 'localhost', () => {
        console.log(`서버를 가동합니다.`);
    });
})

