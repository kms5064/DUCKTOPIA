//몬스터의 움직임을 동기화하는 핸들러.

const moveNotification = async (socket, payload) => {
    const {monsterId} = payload;

    const game = RoomSession.findGameBySocket(socket);
    const player = game.getPlayerBySocket(socket);
    const monster = game.getMonster(monsterId);

    //이런 식으로 게임에서 notification을 보내보도록 하자.
    game.notification()

}