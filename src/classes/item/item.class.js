// item 클래스는 개별 아이템의 속성을 관리함
// 아이템 상태, 아이템 관련 기본 동작 등 하나의 아이템 인스턴스만을 관리함

class Item {
  constructor({ id, type, name, position, code, grade }) {
    this.id = id; // 아이템 고유 식별자
    this.type = type; // 아이템 타입 (FOOD, WEAPON)
    this.name = name; // 아이템 이름
    this.position = position; // 아이템 위치
    this.code = code; // assets에 정의된 아이템 코드
    this.grade = grade; // 아이템 등급 (COMMON, RARE, EPIC, LEGENDARY)
    this.isPickedUp = false; // 습득 여부
  }

  // 아이템 위치 업데이트
  updatePosition(x, y) {
    this.position = { x, y };
  }

  // 아이템 습득 처리
  pickup() {
    if (this.isPickedUp) {
      return false;
    }
    this.isPickedUp = true;
    return true;
  }

  // 아이템 타입 열거형
  static Type = {
    UNKNOWN: 0,
    FOOD: 1,
    WEAPON: 2,
  };

  // 아이템 등급 열거형
  static Grade = {
    COMMON: 'COMMON',
    RARE: 'RARE',
    EPIC: 'EPIC',
    LEGENDARY: 'LEGENDARY',
  };
}

export default Item;
