class Object {
  constructor(id) {
    this.id = id;
    this.hp = 100;
    this.x = 0;
    this.y = 0;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  takeDamage(damage) {
    this.hp -= damage;

    if (this.hp <= 0) {
      this.hp = 0;
      // TODO 오브젝트 제거 처리
    }
  }
}
