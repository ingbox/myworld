export const GAME_STARTED_COOKIE = "game-started";

/** 주요 브라우저가 허용하는 쿠키 수명 상한에 맞춘 400일 */
export const GAME_STARTED_MAX_AGE = 60 * 60 * 24 * 400;

export function isGameStartedCookie(value: string | undefined) {
  return value === "1";
}
