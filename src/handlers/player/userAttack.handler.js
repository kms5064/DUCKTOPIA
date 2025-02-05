const userAttackHandler = (socket, payload) =>{
    // TODO : x, y 체크
    const {x,y} = payload

    // 유저 객체 조회
    const user = getUserBySocket(socket);
    if(!user){
        throw new Error("user does not exist");
    }

    // 게임 ID 조회
    const gameId = user.getGameId();

    // 게임 객체 조회
    const game = getGameById(gameId);
    if(!game){
        throw new Error("game does not exist");
    }

    // Notification - 다른 플레이어들에게 전달
    game.notification(payload,socket);

    // 플레이어 객체 조회
    const player = game.getPlayerById(user.userId);

    // 몬스터 목록 조회
    const monsterList = game.getMonsterList(gameId);
    monsterList.forEach((monster) =>{
        const monsterVector = [monster.x - player.x, monster.y - player.y];

        // TODO : 몬스터 공격 핸들러 구현 시 공통적인 부분 모듈화 처리
        //대상(몬스터)의 거리 계산
        const distance = Math.sqrt(Math.pow(monsterVector[0], 2) + Math.pow(monsterVector[1], 2));
        if(distance <= player.getRange()){

            // 2단계: 각도 범위 내에 있는지 확인 (내적 계산)
            const vectorSize = Math.sqrt(Math.pow(monsterVector[0], 2) + Math.pow(monsterVector[1], 2));
            const normalizedMonsterVector = [monsterVector[0] / vectorSize, monsterVector[1] / vectorSize];

            // TODO : 검증 해봐야함...
            const attackDirection = [1, 0];  // 공격 방향 (예시)

            // 내적계산
            const dotProduct = attackDirection[0] * normalizedMonsterVector[0] + attackDirection[1] * normalizedMonsterVector[1];
            // Radian 변환
            const angleInDegrees = Math.acos(dotProduct) * (180 / Math.PI);

            // 180도
            if (angleInDegrees <= player.getAttackAngle() / 2) {
                //
                const monsterHp = monster.getDamge(player.getPlayerAtkDamage());

                let responsePayload = {};
                if(monsterHp <= 0){
                    // 몬스터 사망
                    responsePayload = {
                        id : monster.id
                    }
                }else{
                    responsePayload = {
                        id : monster.id,
                        hp : monsterHp,
                    }
                }

                // Broadcast - 모든 플레이어에게 전달
                game.broadcast(responsePayload);
            }
        }
    });
};

export default userAttackHandler;