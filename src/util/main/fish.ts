import { DIR_DELTA, type Dir } from "@/src/util/main/chip";
import type { Room } from "@/src/util/main/room";
import catalog from "@/src/util/main/fish.json";

export const FISH_CAST_MS = 700;
export const FISH_BITE_MIN_MS = 2000;
export const FISH_BITE_MAX_MS = 15000;
export const FISH_BITE_WINDOW_MS = 1000;
export const FISH_REEL_MS = 450;

export type FishPhase = "cast" | "wait" | "bite" | "reel" | "done";
export type FishRarity = "common" | "uncommon" | "rare";
export type FishSea = "west" | "east" | "south";

export type FishDef = {
  id: string;
  no: number;
  name: string;
  sea: FishSea;
  rarity: FishRarity;
  weight: number;
  sprite: string;
  blurb: string;
  cell?: string;
  use?: boolean;
  useOnce?: boolean;
  album?: boolean;
};

export type FishingState = {
  phase: FishPhase;
  facing: Dir;
  startedAt: number;
  biteAt: number;
  success: boolean;
  catch: FishDef | null;
};

export const FISH_LIST = catalog.fish as FishDef[];

export const FISH_BY_NO = new Map(FISH_LIST.map((fish) => [fish.no, fish]));

/** 돗돔. 사용하면 희귀 생선 가중치가 올라갑니다. */
export const DOTDOM_NO = 2;

/** 돗돔을 쓴 뒤 희귀 생선 가중치 배율 */
export const RARE_CATCH_BOOST = 1.5;

/** 물이 있는 칸인지 봅니다. */
export function isWaterTile(room: Room, col: number, row: number) {
  return room.sprites.some(
    (sprite) => sprite.piece.startsWith("summer-water") && sprite.col === col && sprite.row === row,
  );
}

/** 물을 바라보고 있으면 낚시를 시작할 수 있습니다. */
export function canFishAt(room: Room, col: number, row: number, facing: Dir) {
  const nextCol = col + DIR_DELTA[facing].dc;
  const nextRow = row + DIR_DELTA[facing].dr;
  return isWaterTile(room, nextCol, nextRow);
}

export function randomBiteDelay() {
  return FISH_BITE_MIN_MS + Math.random() * (FISH_BITE_MAX_MS - FISH_BITE_MIN_MS);
}

/**
 * 가중치대로 잡을 생선을 고릅니다. 희귀 배율을 주면 rare 가중치만 곱합니다.
 *
 * @param rareMultiplier - rare 등급 가중치 배율. 기본 1
 */
export function pickCatch(rareMultiplier = 1): FishDef {
  const scaled = FISH_LIST.map((fish) => ({
    fish,
    weight: fish.rarity === "rare" ? fish.weight * rareMultiplier : fish.weight,
  }));
  const total = scaled.reduce((sum, row) => sum + row.weight, 0);
  let roll = Math.random() * total;
  for (const row of scaled) {
    roll -= row.weight;
    if (roll < 0) return row.fish;
  }
  return FISH_LIST[FISH_LIST.length - 1];
}

/**
 * 이름 뒤에 을/를을 붙입니다.
 *
 * @param name - 한글 이름
 */
export function objectParticle(name: string) {
  const code = name.charCodeAt(name.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return "를";
  return (code - 0xac00) % 28 === 0 ? "를" : "을";
}
