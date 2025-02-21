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


    }

    cancelPattern() {
        if (this.bossPatternTimeOut !== null) {
            clearTimeout(this.bossPatternTimeOut);
            this.bossPatternTimeOut = null;
        }
    }

    //기존에는 패턴이 종료되었을 때 
    lostPlayer() {
    }

    setPattern() {
        if (this.bossPatternTimeOut !== null) {
            return;
        }
        const patternType = Math.floor(Math.random() * 10);
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