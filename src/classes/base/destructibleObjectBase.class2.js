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

    takeDamage(dmg){   
        if(dmg>this.hp){
            //부서지고(게임에서 오브젝트 삭제), 드랍템 떨구기,
        }

    }

    makeDropItem(itemCode){
        this.dropItem.push({})
    }
}