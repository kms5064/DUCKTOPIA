class ItemBox {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.itemList = Array.from({ length: 8 }, () => null);
  }

  getItemList() {
    return this.itemList;
  }

  takeOutAnItem(index, player) {
    const removedItem = this.itemList.splice(index, 1, null);

    player.addItem(removedItem);
  }

  putAnItem(index, item) {
    this.itemList.splice(index, 0, item);

    player.removeItem(item.id);
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
