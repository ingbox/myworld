/** 배경 이미지 기준 정규화 좌표 (0~1) */
export type PathPoint = { x: number; y: number };

/**
 * 땅(갈색 길) waypoints — x 순으로 정렬
 * y: 이미지 상단 기준, 발이 닿는 지점 (값이 클수록 아래)
 */
export const PATH_WAYPOINTS: PathPoint[] = [
  { x: 0.03, y: 0.934 }, // 우리집
  { x: 0.08, y: 0.918 }, // 우리집
  { x: 0.12, y: 0.798 }, // 언덕
  { x: 0.17, y: 0.918 },
  { x: 0.24, y: 0.912 }, // 초등학교
  { x: 0.31, y: 0.912 }, // 축구장
  { x: 0.320, y: 0.850 }, // 
  { x: 0.340, y: 0.810 }, // 
  { x: 0.385, y: 0.810 }, //
  { x: 0.415, y: 0.912 }, 
  { x: 0.430, y: 0.925 },
  { x: 0.460, y: 0.925 }, // 수능 직전
  { x: 0.50, y: 0.946 }, // 수능
  { x: 0.58, y: 0.960 }, // 대학교
  { x: 0.64, y: 0.980 }, // 대학교
  { x: 0.66, y: 0.988 }, // 군대
  { x: 0.73, y: 0.982 }, // 졸업
  { x: 0.75, y: 0.952 }, // 졸업
  { x: 0.78, y: 0.974 }, // 도시
  { x: 0.88, y: 0.999 }, // 스시집
  { x: 0.97, y: 0.965 },
  { x: 0.99, y: 0.980 },
];

/** progress(0~1) → x 위치 기준으로 y 보간 (스크롤과 가로 이동 1:1) */
export function getPathPoint(progress: number): PathPoint {
  const t = Math.min(1, Math.max(0, progress));
  const start = PATH_WAYPOINTS[0];
  const end = PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1];
  const targetX = start.x + t * (end.x - start.x);

  if (targetX <= start.x) return { x: targetX, y: start.y };
  if (targetX >= end.x) return { x: targetX, y: end.y };

  for (let i = 0; i < PATH_WAYPOINTS.length - 1; i++) {
    const a = PATH_WAYPOINTS[i];
    const b = PATH_WAYPOINTS[i + 1];
    if (targetX >= a.x && targetX <= b.x) {
      const local = (targetX - a.x) / (b.x - a.x);
      return {
        x: targetX,
        y: a.y + (b.y - a.y) * local,
      };
    }
  }

  return end;
}
