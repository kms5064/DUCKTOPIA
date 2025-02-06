import Monster from "../../class/monster/monster.class.js";
import { getGameAssets } from "../../init/assets.js";

//몬스터의 아이디를 받으면 생산? 
export const spawnRandomMonsterHandler = async (socket, sequence, payload) => {
    //스테이지의 좌표 정보?
    //플레이어의 위치 정보 내에서 스테이지가 없는 좌표 내에 생성하도록 만들어야 한다.
    //이 위치 정보는 클라이언트 쪽에서 체크해서 보내는 걸로 하자.
    const {x, y} = payload;

    //랜덤 생산 [1] : 몬스터의 랜덤 생성을 요청 받았을 때 그 위치에 생성한다.
    const monsterAsset = getGameAssets().monster;
    const monsterTypeLength = monsterAsset.data.length;
    const randomindex = Math.floor(Math.random() * monsterTypeLength);
    const monsterFind = monsterAsset.data[randomindex];

    //랜덤 생산 [2] : 몬스터의 수치를 조정한다.
    //objectBase의 자식 클래스로 할 거니까 몬스터는 별도의 스테이터스 등을 다시 지정 받는다.
    const newMonster = new Monster("hello world", monsterFind.monsterCode, x, y, monsterFind.range, monsterFind.speed);
    newMonster.setstatus(monsterFind.hp, monsterFind.attack, monsterFind.defence);
    newMonster.setName(monsterFind.name);

    //랜덤 생산 [3] : 생성된 몬스터를 해당 세션에 집어 넣는다.
    //socket을 통해 어떤 세션에 넣을지를 찾아 보도록 하자.

    //랜덤 생산 [4] : 생성 정보 동기화 작업
}