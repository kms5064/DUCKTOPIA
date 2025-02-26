class DestructibleObjectBase{
    constructor(id,code,hp){
        this.id,
        this.code,
        this.hp,
        this.x=0,
        this.y=0
        this.dropItem = Array.from({ length: 4 }, () => 0);
    }


    getObject(){}

    takeDamage(){

    }

    makeDropItem(itemCode){
        this.dropItem.push({})
    }
}