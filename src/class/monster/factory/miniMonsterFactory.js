import { monsterFactory } from "./default.monsterFactory.js";
import { miniMonster } from "../miniMonster.js";


export class miniMonsterFactory extends monsterFactory
{
    createMonster(id,level, monsterCode)
    {
        return new miniMonster(id,level, monsterCode);
    }
}