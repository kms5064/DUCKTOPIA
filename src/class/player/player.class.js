import { ATK_PER_LV, PLAYER_MAX_HUNGER } from '../../constants/player.js';

class Player {
  constructor(id, atk, x, y,user) {
    this.id = id;
    this.maxHp = PLAYER_MAX_HP;
    this.hp = PLAYER_MAX_HP;
    this.hunger = PLAYER_MAX_HUNGER; //허기짐
    this.lv = 1;
    this.atk = atk;
    this.inventory = []; //인벤
    this.equippedWeapon = {}; //무기장착슬롯
    this.x = x;
    this.y = y;
    this.isAlive = true; //생존여부
    this.socket = socket;
    this.user = user;
  }

  //체력 변경
  changePlayerHp(damage) {
    this.hp -= damage;

    if(this.hp<=0){
      this.isAlive = false;
    }

    return this.hp;
  }

  //현재 위치 찾기
  getPlayerPos() {
    return { x: this.x, y: this.y };
  }

  //위치 변경
  changePlayerPos(x, y) {
    this.x = x;
    this.y = y;
    return { x: this.x, y: this.y };
  }

  //허기수치 변경
  changePlayerHunger(amount) {
    this.hunger += amount;
    return this.hunger;
  }

  //플레이어 어택은 데미지만 계산해서 리턴하기
  getPlayerAtkDamage() {
    damage = atk + lv * ATK_PER_LV + this.equippedWeapon.atk;
    return damage;
  }

  //플레이어 사망
  playerDead() {
    this.isAlive = false;
    this.inventory = [];
    return this.isAlive;
  }

  //inventory 배열에서 특정 아이템의 인덱스 찾기
  findItemIndex(itemId) {
    const targetIndex = this.inventory.findIndex((item) => (item.id = itemId));
    return targetIndex;
  }

  //inventory에 특정 아이템 추가
  addItem(item) {
    this.inventory.push(item);
    return this.inventory;
  }

  //inventory에서 특정 아이템 삭제
  removeItem(itemId) {
    const targetIndex = this.findItemIndex(itemId);
    this.inventory.splice(targetIndex, 1);
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
  //위치 패킷은 클라에서 받은 입력(새 좌표)를 받아서 저장하고 저장된 좌표를 나를 제외한 세션의 모든 클라에게 보낸다.
  //너무 자주 보내지 말고 시간을 잘 조절해 보자

  //아니면
  //클라에서 방향변경을 받아서 동기화

  //키보드로 움직이는 게임은 보통 클라에서 먼저 움직이고 서버에 통보하며 통보된 위치를 브로드캐스트

  //가시랜더링 생각해보기

  //허기가0이면 데미지를 받는다
}

export default Player;
