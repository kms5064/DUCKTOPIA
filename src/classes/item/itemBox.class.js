import CustomError from "../../utils/error/customError";

class ItemBox {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    //this.hp = ITEM_BOX_HP;
    this.itemList = Array.from({ length: 8 }, () => null);
    this.occupied = null; //점유중 플레이어아이디
  }

  getItemList() {
    return this.itemList;
  }

  takeOutAnItem(itemType,count, player) {
    //조회하는걸로 바꾸기
    const removedItem = this.itemList.find((item)=>item.type === itemType);
    if(!removedItem){
      throw new CustomError(ErrorCode.ITEM_NOT_FOUND,'상자에서 아이템을 찾을 수 없습니다.');
    }

    if(removedItem.stack>=count){
      removedItem.stack -= count;
    }

    player.addItem(removedItem.TypeNum,count);
    
    return removedItem;
  }

  putAnItem(item) {

    const checkRoom = (ele) => ele ===null;
    const emptyIndex = this.itemList.findIndex(checkRoom);

    if(emptyRoom !== -1){
      this.itemList.splice(emptyIndex, 1, item);
      player.removeItem(item.id);
      return true;
    } else{
      return false;
    }

  }

  calculateDistance(px,py){
    const distance = Math.sqrt(Math.pow((px-this.x),2) + Math.pow((py-this.y),2));
    return distance;
  }

  changeItemPos(index1, index2) {
    [this.itemList[index1], this.itemList[index2]] = [this.itemList[index2], this.itemList[index1]];
  }
}

/*ItemBox라는 클래스를 갖는다. 파괴가능여부에 따라서 objectBase상속
-고유id
-위치
-아이템 리스트(리스트 빈공간은 0으로)

-상자열기(조회)
-아이템 빼기(리스트에서 아이템 제거)
-아이템 넣기(리스트에 아이템 추가)
-아이템 위치 변경
*/
