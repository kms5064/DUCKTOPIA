import RoomSession from "../../classes/room/roomSession.class";

//이건 몬스터가 공격했을 때 어떤 식의 반응이 있을 것인지 테스트하기
const AttackByPlayerHandler = async (socket, payload) => {
  try {
    //몬스터가 플레이어를 때렸을 때 [1] : 우선 몬스터의 정보를 가져온다.
    const { monsterId } = payload;

    //몬스터가 플레이어를 때렸을 때 [2] : 같은 아이디를 가진 플레이어와 몬스터를 세션에서 찾는다.
    const game = RoomSession.findGameBySocket(socket);

    if (!game) {
      throw new Error("game fail");
    }
    const player = game.getPlayerBySocket(socket);

    if(!player)
    {
      throw new Error("player fail");
    }
    const monster = game.getMonster(monsterId);

    //몬스터가 없을 경우의 수가 있을 수 있으니 이것도 고려를 해보자.
    if(!monster)
    {
      //몬스터가 죽었다는 것을 별도로 보내주고 끝내도록 하자.
      const alreadMonsterDead = {
        monsterId : monsterId
      }
    }

    let packet;
    let monsterAttackPayload;

    const remainPlayerHp = user.changePlayerHp(monster.getAttack());

    if (remainPlayerHp <= 0) {
      //유저 사망 처리 먼저 하도록 하자.
      user.isDead();
      //플레이어가 살아날 위치를 지정해준다.

      const playerResponePoint = await game.playerRespone();
      //리스폰 포인트 위치 {responePoint : [x,y], }
      monsterAttackPayload = { responePoint: playerResponePoint };
      packet = createResponse(PACKET_TYPE.PLAYER_DEAD, monsterAttackPayload);
    } else {
      //동기화 패킷은 계속 보내지고 있을 터이니 그 쪽에서 처리하면 될 테고
      monsterAttackPayload = { userId: user.id, userHp: user.hp };
      packet = createResponse(PACKET_TYPE.PLAYER_DAMAGED, monsterAttackPayload);
    }

    game.broadcastAllPlayer(packet);

    //몬스터가 플레이어를 때렸을 때 [3] : 충격 처리

    //몬스터가 플레이어를 때렸을 때 [4] : 동기화 처리
  }
  catch (err) {
    switch(err)
    {
      case "game fail":
        break;
      case "player fail":
        break;
    }
  }

};
