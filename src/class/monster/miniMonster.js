import defaultMonster from "./default.monster.js";

export class miniMonster extends defaultMonster
{
    constructor(id,level = 0,monsterCode = 0)
    {
        super(id,level, monsterCode);
    }

    //죽었는지 확인해보도록 
    monsterDeath()
    {
        const deathCheck = super.monsterDeath();
        if(deathCheck)
        {
            //몬스터의 종류에 따라서 죽을 때의 패턴을 다양하게 할 수 있다.
            switch(this.monsterCode)
            {
                default:
                    break;
            }
        }
    }
}