import defaultMonster from "./default.monster.js";

export class miniMonster extends defaultMonster {
    constructor(id, level = 0, monsterCode = 0) {
        super(id, level, monsterCode);
    }

    //죽었는지 확인해보도록 
    monsterDeath() {
        const deathCheck = super.monsterDeath();
        if (deathCheck) {
            //몬스터의 종류에 따라서 죽을 때의 패턴을 다양하게 할 수 있다.
            switch (this.monsterCode) {
                default:
                    break;
            }
        }
    }

    //무브 위치를 찾아보는 것
    moveByLatency(latency) {
        const lateMove = super.moveByLatency(latency);
        const distance = Math.sqrt(Math.pow(this.priorityPlayer.x - this.x, 2) + Math.pow(this.priorityPlayer.y - this.y, 2));
        const vectorX = (this.priorityPlayer.x - this.x)/distance;//+, -를 구분지어서 할 수 있을 듯
        const vectorY = (this.priorityPlayer.y - this.y)/distance;
        switch (this.monsterCode) {
            case 1:
            case 2:
            case 3:
            case 4:
                //삼각함수를 통해 방향을 정해보자.
                this.x += vectorX * lateMove;
                this.y += vectorY * lateMove;
                break;
            case 5:
            case 6:
            case 7:
            case 8:
                this.x += vectorX * lateMove;
                this.y += vectorY * lateMove;
                break;
        }

        //이 이후 동기화를 보내보도록 하자.
    }
}