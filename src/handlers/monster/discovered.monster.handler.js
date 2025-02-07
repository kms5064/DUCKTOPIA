//몬스터가 플레이어를 발견했을 때의 핸들러

const discoveredMonsterHandler = async (socket, payload) => {
  //플레이어가 발견하는 것이니까
  const { monsterId } = payload;

  const game = getGameBySocket(socket);
  const player = game.getPlayerBySocket(socket);
  const monster = game.getMonsterByMonsterId(monsterId);

  monster.setTargetPlayer(player);

  const discoverPayload = {
    monsterId,
    playerId: player.playerId,
  };

  const packet = createResponse(PACKET_TYPE.MONSTER_DISCOVERED, discoverPayload);

  //몬스터가 탐색이나 생성 등은 game 쪽에서 broadcast를 하는 게 더 나을 듯 하다.
  //유저들이 어떤 몬스터가 어떤 유저를 쫒고 있는지 알아야 하니까
  game.broadcast(packet);
};
