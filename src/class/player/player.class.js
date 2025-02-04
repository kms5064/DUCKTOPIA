class Player{
    constructor(id,maxHp,x,y){
        this.id =id;
        this.maxHp = maxHp;
        this.hp =maxHp;
        this.hunger = 100;
        this.inventory =[];
        this.equippedWeapon = {};
        this.x = x;
        this.y = y;
    }

    getPlayer(){}

    changePlayerHp() {}

    getPlayerPos(){}
    
    changePlayerPos() {}

    findItemInInventory(){}

    changePlayerHunger(){}


}