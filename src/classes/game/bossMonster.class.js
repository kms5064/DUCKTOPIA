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
        super(id, monsterCode, name, hp, attack, defence, range, speed, x, y);

        //보스 몬스터의 패턴 
        this.bossPatternTimeOut = null;


    }

    cencelPattern() {
        if (this.bossPatternTimeOut !== null) {
            clearTimeout(this.bossPatternTimeOut);
            this.bossPatternTimeOut = null;
        }
    }

    death() {
        super.death();
    }


}