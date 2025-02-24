// 거리 계산 함수
export const calculateDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// 벡터 내적 계산 함수
export const vectorDotProduct = (x1, y1, x2, y2) => {
  return x1 * x2 + y1 * y2;
};

// 벡터의 크기(길이) 계산 함수
export const vectorLength = (x, y) => {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
};

// 각도 계산 함수 (도 단위로 반환)
export const calculateAngle = (
  attackerX,
  attackerY,
  attackerDirX,
  attackerDirY,
  targetX,
  targetY,
) => {
  // 플레이어와 몬스터의 벡터 계산
  const targetVecX = targetX - attackerX;
  const targetVecY = targetY - attackerY;

  // 두 벡터의 내적 계산
  const dotProduct = vectorDotProduct(attackerDirX, attackerDirY, targetVecX, targetVecY);

  // 벡터 크기 계산
  const attackerLength = vectorLength(attackerDirX, attackerDirY);
  const targetLength = vectorLength(targetVecX, targetVecY);

  // 두 벡터의 코사인 값 계산
  const cosAngle = dotProduct / (attackerLength * targetLength);

  // 코사인 값으로 각도를 계산 (라디안 -> 도)
  const angle = Math.acos(cosAngle);
  return angle * (180 / Math.PI); // 라디안을 도로 변환
};
