import {ATK_PER_LV,PLAYER_MAX_HUNGER} from '../../constants/player.js'

class Player{
    constructor(id,maxHp,atk,x,y){
        this.id =id;
        this.maxHp = maxHp;
        this.hp =maxHp;
        this.hunger = PLAYER_MAX_HUNGER; //이런 상수값 나중에 constants에서 관리
        this.lv = 1;
        this.atk = atk;
        this.inventory =[];
        this.equippedWeapon = {};
        this.x = x;
        this.y = y;
        this.isAlive = true;
    }


    changePlayerHp(damage) {
        this.hp -= damage;
        return this.hp;
    }

    getPlayerPos(){
        return {x:this.x,y:this.y};
    }
    
    changePlayerPos(x,y) {
        this.x=x;
        this.y=y;
        return {x:this.x,y:this.y};
    }

    changePlayerHunger(amount){
        this.hunger += amount;
        return this.hunger;
    }
    //플레이어 어택은 데미지만 리턴하기
    getPlayerAtkDamage(){
        damage = atk + lv*ATK_PER_LV + this.equippedWeapon.atk;
        return damage;
    }

    playerDead(){
        this.isAlive = false;
        this.inventory = [];
        return this.isAlive;
    }

    findItemIndex(itemId){
        const targetIndex = this.inventory.findIndex((item)=> item.id = itemId);
        return targetIndex;
    }

    addItem(item){
        this.inventory.push(item);
        return this.inventory;
    }

    removeItem(itemId){
        const targetIndex = this.findItemIndex(itemId);
        this.inventory.splice(targetIndex,1);
        return this.inventory;
    }
    
    //유저 동기화는 어떤 방식으로 하지?
    //hp, lv, hunger,inventory,equippedWeapon,isAlive같은 status는 변화가 있을때만 동기화하기
    //hp변화(피격) 브로드캐스트용 패킷
    //lv변화 브로드캐스트용 패킷 / 필요한가?
    //hunger변화 브로드캐스트용 패킷 / 필요한가?
    //equippedWeapon변화 브로드캐스트용 패킷
    //isAlive변화 브로드캐스트용 패킷

    //위치 같은 계속 변화하는건 루프(프레임)마다 동기화
    //위치 패킷
    //키업다운때만 동기화
    //위치 패킷은 클라에서 받은 입력(새 좌표)를 받아서 저장하고 저장된 좌표를 나를 제외한 세션의 모든 클라에게 보낸다.
    //너무 자주 보내지 말고 시간을 잘 조절해 보자

    //가시랜더링 생각해보기

    
}