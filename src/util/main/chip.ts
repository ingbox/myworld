export const TILE = 32;

export const CAMERA_SCALE = 2.5;
export const STEP_MS = 200;

export type Dir = "down" | "left" | "right" | "up";

/** 16x32 베이스 시트. 칸 32x32, 행은 아래·대각·옆·대각뒤·위. */
export const BODY_SHEET = {
  width: 128,
  height: 160,
  cols: 4,
  rows: 5,
  frame: 32,
} as const;

export const PLAYER_WALK = {
  src: "/images/game/player-walk.png",
  ...BODY_SHEET,
} as const;

export const BODY_DIR: Record<Dir, { row: number; flip: boolean }> = {
  down: { row: 0, flip: false },
  right: { row: 2, flip: false },
  left: { row: 2, flip: true },
  up: { row: 4, flip: false },
};

export const DIR_DELTA: Record<Dir, { dc: number; dr: number }> = {
  down: { dc: 0, dr: 1 },
  left: { dc: -1, dr: 0 },
  right: { dc: 1, dr: 0 },
  up: { dc: 0, dr: -1 },
};

function bodyFrameStyle(
  sheet: { src: string; width: number; height: number; frame: number },
  dir: Dir,
  col: number,
) {
  const { row, flip } = BODY_DIR[dir];
  const size = sheet.frame;
  return {
    backgroundImage: `url(${sheet.src})`,
    backgroundRepeat: "no-repeat" as const,
    backgroundSize: `${sheet.width}px ${sheet.height}px`,
    backgroundPosition: `-${col * size}px -${row * size}px`,
    transform: flip ? "scaleX(-1)" : "scaleX(1)",
    imageRendering: "pixelated" as const,
  };
}

/**
 * 검정 머리 플레이어 스프라이트입니다. 시트는 walk 하나만 써서 깜빡임을 막습니다.
 *
 * @param dir - 바라보는 방향
 * @param walkFrame - 0 왼발, 1 서기, 2 오른발
 */
export function playerBackground(dir: Dir, walkFrame: 0 | 1 | 2) {
  const col = walkFrame === 1 ? 0 : walkFrame === 0 ? 1 : 3;
  return bodyFrameStyle(PLAYER_WALK, dir, col);
}
