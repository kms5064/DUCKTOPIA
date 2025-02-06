import Monster from "../../class/monster/monster.class.js";
import { getGameAssets } from "../../init/assets.js";
import { spawnRandomMonsterHandler } from "./spawn.randomMonster.handler.js";

//몬스터의 아이디를 받으면 생산? 
export const spawnMonsterHandler = async (socket, payload) => {
    const {monsterCode, x, y} = payload;

    

    //몬스터 생산 [1] : 몬스터의 생성 위치와 코드를 받아서 생산하도록 한다.
    const monsterAsset = getGameAssets().monster;
    let newMonster;
    if(monsterCode === 0 || monsterCode >= monsterAsset.data.length)
    {
        const randomindex = Math.floor(Math.random() * monsterTypeLength);
        const monsterFind = monsterAsset.data[randomindex];
        newMonster = new Monster("hello world", monsterFind.monsterCode, x, y, monsterFind.range, monsterFind.speed);
    }
    else
    {
        const monsterFind = monsterAsset.data.find((unit)=>unit.monsterCode === monsterCode);
        newMonster = new Monster("hello world", monsterFind.monsterCode, x, y, monsterFind.range, monsterFind.speed);
    }
    //몬스터 생산 [2] : 몬스터의 수치를 조정한다.
    //objectBase의 자식 클래스로 할 거니까 몬스터는 별도의 스테이터스 등을 다시 지정 받는다.
    newMonster.setstatus(monsterFind.hp, monsterFind.attack, monsterFind.defence);
    newMonster.setName(monsterFind.name);

    //몬스터 생산 [3] : 생성된 몬스터를 해당 세션에 집어 넣는다.
    const monsterPayload = newMonster.monsterDataSend();
    
    //socket을 통해 어떤 세션에 넣을지를 찾아 보도록 하자.
    const game = getGameBySocket(socket);

  
    //몬스터 생산 [4] : 생성 정보 동기화 작업
    const packet = monsterPayload(PACKET_TYPE.CREATE_MONSTER, monsterPayload);
    game.broadcast(packet);
    

}