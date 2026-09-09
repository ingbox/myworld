export const EMOTE_SHEET = {
  src: "/images/game/emotions.png",
  width: 240,
  height: 1024,
  frame: 30,
  cols: 8,
  rows: 34,
} as const;

/** 시트 행 이름. 대화 JSON 의 balloon 값으로 씁니다. */
export const EMOTE_ROWS = {
  exclaim: 0,
  question: 1,
  note: 2,
  heart: 3,
  anger: 4,
  sweat: 5,
  confuse: 6,
  ellipsis: 7,
  idea: 8,
  sleep: 9,
  nervous: 10,
  curse: 11,
  heartbreak: 12,
  sparkle: 13,
  gloom: 14,
  stars: 15,
} as const;

export type EmoteId = keyof typeof EMOTE_ROWS;

export const EMOTE_FRAME_MS = 70;

/**
 * 감정 이름에 해당하는 시트 행을 돌려줍니다.
 *
 * @param id - balloon / 근접 감정 id
 */
export function emoteRow(id: string) {
  return EMOTE_ROWS[id as EmoteId] ?? EMOTE_ROWS.exclaim;
}

/**
 * 감정 말풍선 한 프레임의 배경 스타일입니다.
 *
 * @param id - 감정 id
 * @param frame - 0~7
 */
export function emoteBackground(id: string, frame: number) {
  const row = emoteRow(id);
  const col = Math.max(0, Math.min(EMOTE_SHEET.cols - 1, frame));
  const { src, width, height, frame: size } = EMOTE_SHEET;
  return {
    width: size,
    height: size,
    backgroundImage: `url(${src})`,
    backgroundRepeat: "no-repeat" as const,
    backgroundPosition: `-${col * size}px -${row * size}px`,
    backgroundSize: `${width}px ${height}px`,
    imageRendering: "pixelated" as const,
  };
}
