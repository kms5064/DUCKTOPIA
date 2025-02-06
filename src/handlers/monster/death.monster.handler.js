import { spawnRandomMonsterHandler } from "./spawn.randomMonster.handler";

//이 쪽은 진행이 될지 애매함.
const DeathMonsterHandler = async (socket, sequence, payload) => 
{
    //몬스터가 사망했을 때 [1] : 몬스터의 아이디를 확인한다.
    const {id} = payload;

    //몬스터가 사망했을 때 [2] : 몬스터의 id가 속해 있는 세션을 먼저 찾는다.

    //몬스터가 사망했을 때 [3] : 몬스터의 사망 체크를 한다.
    //이 때 몬스터가 사망 후 패턴이 있는 경우 발동하도록 체크한다.
    //몬스터가 사망했을 때 아이템이 드랍되도록 한다.

    const itemdropseed = Math.floor(Math.random() * 2048);
    const findmonster = getMonsterSession().find((monster)=>monster.id === id);
    //드랍률 범위를 이렇게 잡자
    const dropPoint = Math.floor(Math.random() * findmonster.dropCheck());

    //20개의 아이템 중에선 이런 식으로 부르도록 하자.
    const droptable = 20 - Math.floor(Math.log(dropPoint) / Math.log(2));

    const itemDropPayload = {
        itemCode : droptable
    }
    

    
    

    //몬스터가 사망했을 때 [4] : 세션에서 몬스터를 지운다.

    //몬스터가 사망했을 때 [5] : 몬스터의 사망을 동기화한다.
}