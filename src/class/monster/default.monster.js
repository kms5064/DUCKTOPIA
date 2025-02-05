class defaultMonster {
    //몬스터는 각각의 인스턴스로 활용될 것이며 이건 
    //이건 추상 클래스로써 접근할 것이니 
    //위치 동기화는 언제 했는가 
    //monsterCode는 몬스터가 어떤 녀석인지 확인하도록 한다.
    //몬스터와 플레이어는 각각 상하좌우를 베이스로 한 8개 방향으로 이동할 수 있도록 한다.
    constructor(id, level = 0, monsterCode = 0, x = 0, y = 0) {
        if (new.target === defaultMonster) {
            throw new Error("추상 클래스 defaultMonster는 생성할 수 없습니다.");
        }


        if (id === null) {
            throw new Error("몬스터의 id 값이 null로 할당되었습니다.");
        }
        this.id = id;
        this.hp = 0;
        this.attack = 0;
        this.defence = 0;
        this.level = level;
        this.monsterCode = monsterCode;
        this.priorityPlayer = null;
        this.x = x;
        this.y = y;
        //몬스터가 여러 패턴을 가지고 있을 때 그 패턴들을 이 안에서 쿨타임을 관리한다.
        this.patternInterval = new Map();
        //범위 내에 들어온 플레이어를 이 안에 집어 넣는다. 
        this.followingPlayer = new Map();
    }

    //asset을 통해서 받은 데이터를 기반으로 여기에 데이터를 채워 넣는다. 
    //이건 몬스터가 생성되고 이걸 별도의 배열 등에 집어 넣기 전에 불러야 할 것
    getstatus(hp, attack, defence) {
        this.hp = hp;
        this.attack = attack;
        this.defence = defence;
        console.log(`${this.hp}, ${this.attack}, ${this.defence}`)
    }

    getDamaged(damage) {
        if (damage - this.defence < 0) {
            this.hp -= 1;
        }
        else {
            this.hp -= (damage - this.defence);
        }
    }

    //캐릭터의 우선도를 뒤에서 보도록 할까.
    catchingPlayer(player) {
        if (!this.followingPlayer.has(player)) {
            this.followingPlayer.set(player, this.followingPlayer.size);
        }
    }

    //생성되었을 때 위치 지정은 이걸로 해주자.
    //내 생각에 x, y는 맵의 중간 지점을 (0,0)이라 했을 때의 값이라 생각함
    //
    setPositionFromCreating(x, y) {
        this.x = x;
        this.y = y;
    }

    //플레이어의 정보를 잃어버릴 때
    //플레이어의 렌더링 범위에서 벗어났을 때
    lostPlayer(player) {
        if(this.followingPlayer.has(player))
        {
            this.followingPlayer.delete(player);
        }
    }

    //몬스터의 플레이어 추적을 무력화 시킨다.
    clearPlayer() {
        this.followingPlayer.clear();
        this.priorityPlayer = null;
    }

    //default로 호출될 때는 별다른 기능 없음
    //x가 -1이면 왼쪽 1이면 오른쪽
    //y가 -1이면 아래쪽 1이면 위쪽
    moveByLatency(latency) {
        const timediff = latency/1000;//레이턴시는 1초를 1000으로 받아온다는 전제
        const speed = 1;
        const distance = speed * timediff;

        return distance;
    }

    //몬스터가 사망했을 때의 데이터
    //이후 몬스터 사망 시 아이템 드롭도 해야 하나
    monsterDeath() {
        if (this.hp <= 0) {
            return true;
        }
        else {
            return false;
        }
    }

    monsterClearInterval()
    {

    }

    monsterDataSend() {
        const monsterData = {
            id: this.id,
            hp: this.hp,
            x: this.x,
            y: this.y,
        }

        return monsterData;
    }


}

export default defaultMonster;