export type JourneyStage = {
  src: string;
  label: string;
  /** 캐릭터 표시 높이(px) — 커갈수록 커짐 */
  height: number;
  /** 원본 PNG 가로/세로(px) — next/image 비율 계산용 */
  naturalWidth: number;
  naturalHeight: number;
  /** 배경 이미지 x(0~1) — 이 장면에서 해당 캐릭터가 완전히 보이는 위치 */
  anchorX: number;
};

const CHAR = "/images/profile/history/char";

/** 배경 장면 순서와 1:1로 대응 (왼→오) — height는 520px 컨테이너 기준 건물 비율 */
export const JOURNEY_STAGES: JourneyStage[] = [
  { src: `${CHAR}/char-01-baby.png`, label: "아기", height: 34, naturalWidth: 817, naturalHeight: 735, anchorX: 0.03 },
  { src: `${CHAR}/char-02-kinder.png`, label: "유치원", height: 46, naturalWidth: 445, naturalHeight: 845, anchorX: 0.12 },
  { src: `${CHAR}/char-03-elementary.png`, label: "초등학교", height: 53, naturalWidth: 485, naturalHeight: 930, anchorX: 0.24 },
  { src: `${CHAR}/char-04-soccer.png`, label: "축구", height: 55, naturalWidth: 895, naturalHeight: 921, anchorX: 0.31 },
  { src: `${CHAR}/char-05-uniform.png`, label: "고등학교 · PC방", height: 62, naturalWidth: 473, naturalHeight: 936, anchorX: 0.385 },
  { src: `${CHAR}/char-05-uniform.png`, label: "수능", height: 62, naturalWidth: 473, naturalHeight: 936, anchorX: 0.5 },
  { src: `${CHAR}/char-06-university.png`, label: "대학교", height: 67, naturalWidth: 494, naturalHeight: 982, anchorX: 0.58 },
  { src: `${CHAR}/char-07-military.png`, label: "군대", height: 69, naturalWidth: 528, naturalHeight: 947, anchorX: 0.66 },
  { src: `${CHAR}/char-08-graduation.png`, label: "졸업", height: 71, naturalWidth: 334, naturalHeight: 972, anchorX: 0.73 },
  { src: `${CHAR}/char-09-work.png`, label: "취업", height: 74, naturalWidth: 486, naturalHeight: 935, anchorX: 0.78 },
  { src: `${CHAR}/char-10-canada.png`, label: "캐나다 스시집", height: 76, naturalWidth: 488, naturalHeight: 910, anchorX: 0.88 },
  { src: `${CHAR}/char-11-now.png`, label: "지금", height: 78, naturalWidth: 249, naturalHeight: 981, anchorX: 0.97 },
];

/**
 * 캐릭터의 현재 x(배경 기준 0~1) → 스테이지 좌표(0~N-1)
 * anchorX 사이를 선형 보간 — 스크롤 위치와 배경 장면 x가 맞을 때 캐릭터가 바뀜
 */
export function stagePosFromX(x: number): number {
  const last = JOURNEY_STAGES.length - 1;
  const first = JOURNEY_STAGES[0].anchorX;
  const end = JOURNEY_STAGES[last].anchorX;

  if (x <= first) return 0;
  if (x >= end) return last;

  for (let i = 0; i < last; i++) {
    const a = JOURNEY_STAGES[i].anchorX;
    const b = JOURNEY_STAGES[i + 1].anchorX;
    if (x >= a && x <= b) {
      return i + (x - a) / (b - a);
    }
  }

  return last;
}

/**
 * 스크롤 진행도(0~1)를 스테이지 좌표(0~N-1)로 변환한 뒤,
 * 각 스테이지의 표시 opacity를 계산한다.
 * 인접 스테이지끼리 넓은 구간에서 디졸브 크로스페이드된다.
 */
export function stageOpacity(pos: number, index: number): number {
  const d = Math.abs(pos - index);
  const solid = 0.3; // 완전히 보이는 구간
  const fade = 0.55; // 디졸브 끝
  if (d <= solid) return 1;
  if (d >= fade) return 0;
  const t = (d - solid) / (fade - solid);
  // ease-in-out 느낌의 부드러운 페이드
  return 1 - t * t * (3 - 2 * t);
}

/** 스테이지 사이 높이를 선형 보간 */
export function stageHeight(pos: number): number {
  const stages = JOURNEY_STAGES;
  const last = stages.length - 1;
  const clamped = Math.min(last, Math.max(0, pos));
  const i = Math.floor(clamped);
  const t = clamped - i;
  const a = stages[i].height;
  const b = stages[Math.min(i + 1, last)].height;
  return a + (b - a) * t;
}
