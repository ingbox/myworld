/** 지정 카드 도감 칸 수 */
export const ALBUM_SIZE = 99;

export const ALBUM_COOKIE = "album";

export const ALBUM_COLS = 9;

/**
 * 도감에 넣을 수 있는 번호인지 봅니다. 목록은 1~99입니다.
 *
 * @param no - 아이템 번호
 */
export function isAlbumNo(no: number) {
  return Number.isInteger(no) && no >= 1 && no <= ALBUM_SIZE;
}

/**
 * 도감 커서를 한 칸 옮깁니다. 9열 격자라 위아래는 한 줄입니다.
 *
 * @param current - 지금 번호 (1~99)
 * @param dir - 화살표 방향
 */
export function moveAlbumCursor(current: number, dir: "up" | "down" | "left" | "right") {
  const i = current - 1;
  const col = i % ALBUM_COLS;
  const row = Math.floor(i / ALBUM_COLS);
  const rows = Math.ceil(ALBUM_SIZE / ALBUM_COLS);
  let nextCol = col;
  let nextRow = row;
  if (dir === "left") nextCol = col === 0 ? ALBUM_COLS - 1 : col - 1;
  if (dir === "right") nextCol = col === ALBUM_COLS - 1 ? 0 : col + 1;
  if (dir === "up") nextRow = row === 0 ? rows - 1 : row - 1;
  if (dir === "down") nextRow = row === rows - 1 ? 0 : row + 1;
  const next = nextRow * ALBUM_COLS + nextCol + 1;
  if (next < 1 || next > ALBUM_SIZE) return current;
  return next;
}
