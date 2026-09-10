/** 종류당 개수 상한 (1바이트) */
export const BAG_COUNT_MAX = 255;

/** 주요 브라우저가 허용하는 쿠키 수명 상한에 맞춘 400일 */
export const BAG_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export type DexDef = {
  cookie: string;
  start: number;
  size: number;
};

/** 번호 1~255. 지금은 칸만 두고 목록은 비웁니다. */
export const DEX_1: DexDef = { cookie: "dex-1", start: 1, size: 255 };

/** 번호 256~493. 물고기는 여기부터입니다. */
export const DEX_2: DexDef = { cookie: "dex-2", start: 256, size: 238 };

export const DEXES = [DEX_1, DEX_2] as const;

export type BagEntry = {
  no: number;
  count: number;
};

/**
 * 도감 번호가 들어가는 쿠키를 고릅니다.
 *
 * @param no - 도감 번호
 */
export function dexForNo(no: number): DexDef | null {
  if (no >= DEX_1.start && no < DEX_1.start + DEX_1.size) return DEX_1;
  if (no >= DEX_2.start && no < DEX_2.start + DEX_2.size) return DEX_2;
  return null;
}

/**
 * 쿠키 안에서의 칸 인덱스를 구합니다.
 *
 * @param dex - 도감
 * @param no - 도감 번호
 */
export function dexIndex(dex: DexDef, no: number) {
  return no - dex.start;
}
