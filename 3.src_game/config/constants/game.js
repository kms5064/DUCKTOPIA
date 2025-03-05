export const DayPhase = {
  DAY: 0,
  NIGHT: 1,
};
Object.freeze(DayPhase);

export const WaveState = {
  NONE: 0,
  INWAVE: 1,
};
Object.freeze(WaveState);

export const DAY_TIME = 300000; // 5분
export const NIGHT_TIME = 120000; // 2분
export const FRAME_PER_40 = 1000 / 40; // 40프레임
