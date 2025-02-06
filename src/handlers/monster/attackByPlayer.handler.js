//이건 몬스터가 공격했을 때 어떤 식의 반응이 있을 것인지 테스트하기
const AttackByPlayerHandler = async (socket, payload) => {

    //몬스터가 플레이어를 때렸을 때 [1] : 우선 몬스터의 정보를 가져온다.
    const {monsterId} = payload;

    //몬스터가 플레이어를 때렸을 때 [2] : 같은 아이디를 가진 플레이어와 몬스터를 세션에서 찾는다.
    const user = getUserBySocket(socket);
    if(!user)
    {
        return;
    }

    const gameId = user.getGameId();
    const game = getGameById(gameId);

    if(!game)
    {
        return;
    }

    //게임이라는 가상의 세션에서 가져온다고 하자.
    const monster = game.getMonsterByMonsterId(monsterId);

    
    
    let packet;
    let monsterAttackPayload;
    
    const remainPlayerHp = user.changePlayerHp(monster.getAttack());

    if(remainPlayerHp <= 0)
    {
        //유저 사망 처리 먼저 하도록 하자.
        user.isDead();
        //플레이어가 살아날 위치를 지정해준다.

        const playerResponePoint = await game.playerRespone();
        //리스폰 포인트 위치 {responePoint : [x,y], }
        monsterAttackPayload = {responePoint : playerResponePoint};
        packet = createResponse(PACKET_TYPE.PLAYER_DEAD, monsterAttackPayload);
    }
    else
    {
        //동기화 패킷은 계속 보내지고 있을 터이니 그 쪽에서 처리하면 될 테고
        monsterAttackPayload = {};
        packet = createResponse(PACKET_TYPE.PLAYER_DAMAGED, monsterAttackPayload);
    }

    game.broadcast(packet);
    

    //몬스터가 플레이어를 때렸을 때 [3] : 충격 처리

    //몬스터가 플레이어를 때렸을 때 [4] : 동기화 처리
}