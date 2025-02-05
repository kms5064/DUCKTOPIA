import { monsterFactory } from "./default.monsterFactory.js";
import { bossMonster } from "../boss.monster.js";

export class bossMonsterFactory extends monsterFactory
{
    createMonster(id, level, monsterCode)
    {
        //몬스터의 코드를 여기서 관리할 거라면 
        return new bossMonster(id, level, monsterCode);
    }
}