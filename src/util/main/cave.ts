/** 맵으로 만들어 둔 동굴 방 개수. cave-0 부터 셉니다. */
export const CAVE_ROOM_COUNT = 2;

/**
 * 관문 N 을 풀면 들어가는 방 아이디입니다.
 *
 * @param gate - 관문 번호
 */
export function caveRoomId(gate: number) {
  return `cave-${gate}`;
}

/**
 * 그 관문 너머 방이 맵에 있는지 봅니다.
 *
 * @param gate - 관문 번호
 */
export function hasCaveRoom(gate: number) {
  return Number.isInteger(gate) && gate >= 0 && gate < CAVE_ROOM_COUNT;
}

/**
 * 답을 비교하기 전에 공백을 정리합니다.
 *
 * @param text - 사용자가 친 답
 */
export function normalizeCaveAnswer(text: string) {
  return text.normalize("NFC").trim().replace(/\s+/g, " ");
}
