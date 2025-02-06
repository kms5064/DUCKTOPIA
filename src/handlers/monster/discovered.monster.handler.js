//몬스터가 플레이어를 발견했을 때의 핸들러

const discoveredMonsterHandler = async (socket, payload) => {
    //플레이어가 발견하는 것이니까 
    const {monsterId} = payload;

    const game = getGameBySocket(socket);
    const player = game.getPlayerBySocket(socket);
    const monster = game.getMonsterByMonsterId(monsterId);

    monster.setTargetPlayer(player);

    const discoverPayload = {
        monsterId,
        playerId : player.playerId
    }

    const packet = createResponse(PACKET_TYPE.MONSTER_DISCOVERED, discoverPayload);

    game.broadcast(packet);



}