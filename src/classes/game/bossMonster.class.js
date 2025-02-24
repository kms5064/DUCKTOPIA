import Monster from "./monster.class.js";

class BossMonster extends Monster {
    constructor(
        id,
        code, // monster.json의 monsterCode -> code로 변경됐으므로 이름 변경
        name,
        hp,
        attack,
        defence,
        range,
        speed,
        grade,
        x = 0,
        y = 0,
        isWaveMonster = false,
    ) {
        //기본적인 작동 자체는 여기서 처리하는 게 맞다.
        super(id, code, name, hp, attack, defence, range, speed, grade, x, y, isWaveMonster);

        //보스 몬스터의 패턴 
        this.bossPatternTimeOut = null;
        //보스 몬스터는 기본적으로 시작 지점에 대한 정보를 가지고 있어야 한다.

        //보스 몬스터의 어그로 수치 관리용
        this.hatePointList = new Map();


    }

    //보스는 생성과 동시에 스타트 포지션이 돌아오는 게 맞다고 생각된다.
    setPosition(x, y) {
        super.setPosition(x, y);
        super.setStartPosition(x, y);
    }

    cancelPattern() {
        if (this.bossPatternTimeOut !== null) {
            clearTimeout(this.bossPatternTimeOut);
            this.bossPatternTimeOut = null;
        }
    }

    setDamaged(player, damage) {
        const newAggro = Math.max(0, this.hatePointList.get(player) + damage);
        this.hatePointList.set(player, newAggro);
        return super.setDamaged(damage);
    }

    //어그로 수치를 풀 때 쓰임
    resetHatePoint() {

    }

    //1인을 쫒아갈 때 
    setTargetPlayer(player) {
        super.setTargetPlayer(player);
    }

    setDamaged(damage) {
        super.setDamaged(damage);
    }

    setPlayerList(players) {
        for (const player of players) {
            this.hatePointList.set(player, 0);
        }
    }

    //이 기능은 이 몬스터가 보스 몬스터라는 걸 증명하기 위함
    isBossMonster() {
        return true;
    }

    //기존에는 패턴이 종료되었을 때
    //1. 일단 targetPlayer가 있는지 살핀다.
    //2. hatePointList 내에 해당 플레이어의 정보가 있는지 살핀다.
    //3. 보스 몬스터의 조건은 뭐가 있을까. 일단 어그로를 어떻게 관리할 것인가도 봐야겠다.
    lostPlayer() {
        if (this.bossPatternTimeOut !== null) {
            return false;
        }

        const distanceFromStartPoint = Math.sqrt(
            Math.pow(this.x - this.startPoint_x, 2) + Math.pow(this.y - this.startPoint_y, 2),
        );

        if (distanceFromStartPoint < this.awakeRange + 20) {
            return true;
        }


        if (this.targetPlayer !== null) {
            if (this.hatePointList.has(this.targetPlayer)) {
                if (this.hatePointList.get(this.targetPlayer) < 200) {
                    this.targetPlayer = null;
                    return true;
                }
            }
            else {
                return false;
            }
            this.targetPlayer = null;
        }
        else {
            return false;
        }


    }

    //현재 보스 몬스터가 캠프에 가까이 와 있다면 한 번에 그 캠프를 파괴한다.

    setPattern() {
        if (this.bossPatternTimeOut !== null) {
            return;
        }
        let patternType = Math.floor(Math.random() * 10);

        //타겟이 없을 경우엔 무조건 범위 공격으로 가도록 함.
        if (this.monsterAwakeCoolTime > 0) {
            patternType = 8;
        }
        switch (patternType) {
            case 0:
            case 1:
            case 2:
            case 3:
                this.bossPatternTimeOut = setTimeout(() => {
                    //보스 몬스터 내부에는 이런 식으로 
                    this.cancelPattern();
                }, 1000);
                break;
            case 4:
            case 5:
            case 6:
            case 7:
                this.bossPatternTimeOut = setTimeout(() => {

                }, 4000);
                break;
            case 8:
            case 9:
                //전체 공격이라고 하자.
                this.bossPatternTimeOut = setTimeout(() => {

                }, 5000);
                break;
            default:
                break;
        }
    }

    dropItemCount() {
        const defaultdrop = super.dropItemCount() + 3;
        return defaultdrop;
    }


    death() {

    }

    setTargetPlayer(player) {
        super.setTargetPlayer(player);
        this.setPattern();
    }



    lostPlayer() {
        if (this.targetPlayer === null) {
            return;
        }
    }


}

export default BossMonster;