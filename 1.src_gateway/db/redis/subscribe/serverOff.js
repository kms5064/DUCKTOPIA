import { serverSession } from "../../../sessions/session";

const serverOff = (socketId) => {
    const server = serverSession.getServerById(socketId)
    if(!server) return

    console.log("헬스체킹에 의해 서버다운")

    server.socket.end()
    server.socket.destroy()
};

export default serverOff;
