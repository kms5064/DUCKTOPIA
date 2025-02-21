import Monster from "./monster.class.js";

class bossMonster extends Monster {
    constructor(
        id,
        monsterCode,
        name,
        hp,
        attack,
        defence,
        range,
        speed,
        x = 0,
        y = 0,
        isWaveMonster = false,
    ) {
        //기본적인 작동 자체는 여기서 처리하는 게 맞다.
        super(id, monsterCode, name, hp, attack, defence, range, speed, x, y, isWaveMonster);

        //보스 몬스터의 패턴 
        this.bossPatternTimeOut = null;
        //보스 몬스터는 기본적으로 시작 지점에 대한 정보를 가지고 있어야 한다.


    }

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

    //1인을 쫒아갈 때 
    setTargetPlayer(player) {
        super.setTargetPlayer(player);
    }

    setDamaged(damage) {
        super.setDamaged(damage);
    }

    //기존에는 패턴이 종료되었을 때 
    lostPlayer() {
        this.targetPlayer = null;
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
        super.death();
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

export default bossMonster;