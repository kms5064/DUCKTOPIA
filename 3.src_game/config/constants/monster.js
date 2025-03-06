//드랍률 테이블에 쓰일 숫자. 이 값을 베이스로 log(x)/log(2)로 연산하여 아이템 드롭 갯수 테이블을 작성할 예정
export const MAX_DROP_ITEM_COUNT = 1024;
export const MAX_SPAWN_COUNT = 200; //맵 수정되면 조정하겠습니다!

export const NORMAL_MONSTER_MAX_CODE = 8;

export const WAVE_MAX_MONSTER_COUNT = 20; //일단 20으로

export const WAVE_MONSTER_MIN_CODE = 101;
export const WAVE_MONSTER_MAX_CODE = 103;

export const MIN_COOLTIME_MONSTER_TRACKING = 5000; //추적 쿨타임 기본값
export const MIN_COOLTIME_MONSTER_AWAKING = 5000; //인식 쿨타임 기본값
export const RANGE_COOLTIME_MONSTER_TRACKING = 4000; //추적 쿨타임의 범위
export const RANGE_COOLTIME_MONSTER_AWAKING = 4000; //인식 쿨타임의 범위
