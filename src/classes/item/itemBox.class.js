import CustomError from '../../utils/error/customError.js';

class ItemBox {
  constructor(boxId) {
    this.id = boxId;
    this.x = 0;
    this.y = 0;
    //this.type = type;
    //this.hp = ITEM_BOX_HP;
    this.itemList = Array.from({ length: 8 }, () => null);
    this.occupied = null; //점유중 플레이어아이디
  }

  getItemList() {
    return this.itemList;
  }

  //플레이어가 박스에서 꺼내기
  takeOutAnItem(player,itemCode, count,emptyIndex) {
    //temType을 기반으로 박스에 아이템 조회
    const removedItem = this.itemList.find((item) => item.code === itemCode);
    const removedItemIndex = this.itemList.findindex((item) => item.code === code);
    if (!removedItem) {
      throw new CustomError('상자에서 아이템을 찾을 수 없습니다.');
    }

    //보유량이 더 많으면 갯수만 줄이기
    if (removedItem.stack >= count) {
      removedItem.stack -= count;
    } else {
      //아이템을 제거하고 stack만큼만 아이템을 반환하도록
      count = removedItem.stack;
      this.itemList.splice(removedItemIndex, 1, null);
      const item = player.addItem(itemCode, count,emptyIndex);
      return item;
    }
    //player 인벤토리에 추가된 item반환
    return removedItem;
  }
  //플레이어가 박스에 넣기
  putAnItem(player,itemCode, count,emptyIndex) {
    const item = { itemCode: itemCode ,count: count };
    this.itemList.splice(emptyIndex, 1, item);
    player.removeItem(itemCode);
    return item;
  }

  calculateDistance(px, py) {
    const distance = Math.sqrt(Math.pow(px - this.x, 2) + Math.pow(py - this.y, 2));
    return distance;
  }

  changeItemPos(index1, index2) {
    [this.itemList[index1], this.itemList[index2]] = [this.itemList[index2], this.itemList[index1]];
  }


}

export default ItemBox;

/*ItemBox라는 클래스를 갖는다. 파괴가능여부에 따라서 objectBase상속
-고유id
-위치
-아이템 리스트(리스트 빈공간은 0으로)

-상자열기(조회)
-아이템 빼기(리스트에서 아이템 제거)
-아이템 넣기(리스트에 아이템 추가)
-아이템 위치 변경
*/
