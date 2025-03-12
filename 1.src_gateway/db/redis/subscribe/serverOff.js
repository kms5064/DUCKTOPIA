import { serverSession } from "../../../sessions/session.js";

const serverOff = (socketId) => {
    const server = serverSession.getServerById(socketId)
    if(!server) return

    console.log(`${socketId} 서버와 접속종료`)

    server.socket.end()
    server.socket.destroy()
};

export default serverOff;
