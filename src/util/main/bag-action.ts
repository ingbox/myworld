"use server";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import {
  BAG_COOKIE_MAX_AGE,
  BAG_COUNT_MAX,
  DEXES,
  dexForNo,
  dexIndex,
  type BagEntry,
  type DexDef,
} from "@/src/util/main/bag";
import { ALBUM_COOKIE, ALBUM_SIZE, isAlbumNo } from "@/src/util/main/album";
import {
  ITEM_LIST,
  canRegisterItem,
  itemHasStockLimit,
  itemTrackedInDb,
  lookupItem,
} from "@/src/util/main/item";
import { ensurePlayer } from "@/src/util/main/mark-game-started";
import {
  getPlayerItemCount,
  grantPlayerItem,
  playerHasUsedItem,
  usePlayerItem,
} from "@/src/lib/api/main/service";
import { DOTDOM_NO, RARE_CATCH_BOOST, objectParticle } from "@/src/util/main/fish";

const SECRET = process.env.FISH_BAG_SECRET ?? "pokemon12";

function signCounts(counts: Buffer) {
  return createHmac("sha256", SECRET).update(counts).digest("base64url");
}

/**
 * 개수 바이트를 서명된 쿠키 문자열로 만듭니다.
 *
 * @param counts - 종류당 1바이트
 */
function encodeDex(counts: Buffer) {
  return `v1.${counts.toString("base64url")}.${signCounts(counts)}`;
}

/**
 * 서명이 맞으면 개수 바이트를 돌려주고, 아니면 빈 도감으로 봅니다.
 *
 * @param value - 쿠키 값
 * @param size - 도감 칸 수
 */
function decodeDex(value: string | undefined, size: number) {
  const empty = Buffer.alloc(size);
  if (!value) return empty;
  const parts = value.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return empty;
  let counts: Buffer;
  try {
    counts = Buffer.from(parts[1], "base64url");
  } catch {
    return empty;
  }
  if (counts.length !== size) return empty;
  const expected = signCounts(counts);
  const actual = parts[2];
  if (actual.length !== expected.length) return empty;
  if (!timingSafeEqual(Buffer.from(actual), Buffer.from(expected))) return empty;
  return counts;
}

async function writeDex(dex: DexDef, counts: Buffer) {
  const jar = await cookies();
  jar.set(dex.cookie, encodeDex(counts), {
    path: "/",
    maxAge: BAG_COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: true,
  });
}

/**
 * 서명된 도감 쿠키에서 개수가 있는 칸만 모읍니다.
 * 처음 오는 사용자에게는 시작 아이템을 한 개 줍니다.
 */
export async function getBag(): Promise<BagEntry[]> {
  const playerId = await ensurePlayer();
  const jar = await cookies();
  let mutated: Record<string, Buffer> | undefined;
  try {
    mutated = await giveStarterItems(playerId, jar);
  } catch {
    /* 테이블이 아직 없어도 게임은 진행합니다. */
  }
  return readBag(jar, mutated);
}

/**
 * 도감 번호 한 칸을 1 늘립니다. 상한은 255입니다.
 *
 * @param no - 도감 번호
 */
export async function addCatch(no: number): Promise<BagEntry[]> {
  const dex = dexForNo(no);
  if (!dex) return getBag();
  const jar = await cookies();
  const playerId = await ensurePlayer();
  if (itemHasStockLimit(no) || itemTrackedInDb(no)) {
    try {
      const granted = await grantPlayerItem(playerId, no);
      if (!granted.ok) return readBag(jar);
    } catch {
      return readBag(jar);
    }
  }
  const counts = Buffer.from(decodeDex(jar.get(dex.cookie)?.value, dex.size));
  const index = dexIndex(dex, no);
  counts[index] = Math.min(BAG_COUNT_MAX, counts[index] + 1);
  await writeDex(dex, counts);
  return readBag(jar, { [dex.cookie]: counts });
}

/**
 * 필드에서 아이템 1개를 줍습니다. 개인 한도를 넘으면 가방에 넣지 않습니다.
 *
 * @param no - 아이템 번호
 */
export async function pickupItem(no: number): Promise<AlbumResult> {
  const playerId = await ensurePlayer();
  const jar = await cookies();
  const bag = readBag(jar);
  const album = readAlbum(decodeDex(jar.get(ALBUM.cookie)?.value, ALBUM.size));
  const item = lookupItem(no);
  const dex = dexForNo(no);
  if (!dex) {
    return { ok: false, message: "얻을 수 없다.", bag, album };
  }
  const counts = Buffer.from(decodeDex(jar.get(dex.cookie)?.value, dex.size));
  const index = dexIndex(dex, no);
  const cap = item.maxPerPlayer ?? BAG_COUNT_MAX;
  if (counts[index] >= cap) {
    return { ok: false, message: "더 이상 가질 수 없다.", bag, album };
  }
  try {
    const granted = await grantPlayerItem(playerId, no);
    if (!granted.ok) {
      return { ok: false, message: granted.message, bag, album };
    }
  } catch {
    return { ok: false, message: "지금은 얻을 수 없다.", bag, album };
  }
  counts[index] += 1;
  await writeDex(dex, counts);
  return {
    ok: true,
    message: `${item.name}${objectParticle(item.name)} 얻었다.`,
    bag: readBag(jar, { [dex.cookie]: counts }),
    album,
  };
}

const ALBUM: DexDef = { cookie: ALBUM_COOKIE, start: 1, size: ALBUM_SIZE };

function readBag(
  jar: Awaited<ReturnType<typeof cookies>>,
  mutated?: Record<string, Buffer>,
) {
  const entries: BagEntry[] = [];
  for (const dex of DEXES) {
    const counts = mutated?.[dex.cookie] ?? decodeDex(jar.get(dex.cookie)?.value, dex.size);
    for (let i = 0; i < counts.length; i++) {
      const count = counts[i];
      if (count > 0) entries.push({ no: dex.start + i, count });
    }
  }
  return entries;
}

/**
 * 목록에서 시작 아이템을 아직 안 받은 사용자에게 한 개 줍니다.
 *
 * @param playerId - 게임 사용자 UUID
 * @param jar - 요청 쿠키
 */
async function giveStarterItems(
  playerId: string,
  jar: Awaited<ReturnType<typeof cookies>>,
) {
  const albumFlags = decodeDex(jar.get(ALBUM.cookie)?.value, ALBUM.size);
  const mutated: Record<string, Buffer> = {};
  const dirty = new Set<string>();

  function countsFor(dex: DexDef) {
    if (!mutated[dex.cookie]) {
      mutated[dex.cookie] = Buffer.from(decodeDex(jar.get(dex.cookie)?.value, dex.size));
    }
    return mutated[dex.cookie];
  }

  for (const item of ITEM_LIST) {
    if (!item.starter) continue;
    const dex = dexForNo(item.no);
    if (!dex) continue;
    const counts = countsFor(dex);
    const index = dexIndex(dex, item.no);
    const inAlbum = isAlbumNo(item.no) && albumFlags[item.no - ALBUM.start] > 0;

    let held: number | null = null;
    try {
      held = await getPlayerItemCount(playerId, item.no);
      if (held === null) await grantPlayerItem(playerId, item.no);
    } catch {
      held = null;
    }

    if (inAlbum || counts[index] > 0) continue;
    if (held === 0) continue;
    counts[index] = held && held > 0 ? Math.min(BAG_COUNT_MAX, held) : 1;
    dirty.add(dex.cookie);
  }

  for (const dex of DEXES) {
    if (dirty.has(dex.cookie)) await writeDex(dex, mutated[dex.cookie]);
  }
  return dirty.size > 0 ? mutated : undefined;
}

function readAlbum(flags: Buffer) {
  const nos: number[] = [];
  for (let i = 0; i < flags.length; i++) {
    if (flags[i] > 0) nos.push(ALBUM.start + i);
  }
  return nos;
}

export type AlbumResult = {
  ok: boolean;
  message: string;
  bag: BagEntry[];
  album: number[];
};

/**
 * 도감에 등록된 번호를 읽습니다.
 */
export async function getAlbum() {
  const jar = await cookies();
  return readAlbum(decodeDex(jar.get(ALBUM.cookie)?.value, ALBUM.size));
}

/**
 * 가방에 있는 지정 카드를 도감에 올립니다. 카드 한 장이 가방에서 빠집니다.
 *
 * @param no - 도감 번호 1~99
 */
export async function registerToAlbum(no: number): Promise<AlbumResult> {
  await ensurePlayer();
  const jar = await cookies();
  const bag = readBag(jar);
  const album = readAlbum(decodeDex(jar.get(ALBUM.cookie)?.value, ALBUM.size));
  if (!canRegisterItem(no)) {
    return { ok: false, message: "도감에 등록할 수 없는 아이템이다.", bag, album };
  }
  const dex = dexForNo(no);
  if (!dex) {
    return { ok: false, message: "도감에 등록할 수 없는 아이템이다.", bag, album };
  }
  const flags = Buffer.from(decodeDex(jar.get(ALBUM.cookie)?.value, ALBUM.size));
  const slot = no - ALBUM.start;
  if (flags[slot] > 0) {
    return { ok: false, message: "이미 도감에 있다.", bag, album };
  }
  const counts = Buffer.from(decodeDex(jar.get(dex.cookie)?.value, dex.size));
  const index = dexIndex(dex, no);
  if (counts[index] < 1) {
    return { ok: false, message: "가진 아이템이 없다.", bag, album };
  }
  counts[index] -= 1;
  flags[slot] = 1;
  await writeDex(dex, counts);
  await writeDex(ALBUM, flags);
  return {
    ok: true,
    message: "도감에 등록했다.",
    bag: readBag(jar, { [dex.cookie]: counts }),
    album: readAlbum(flags),
  };
}

/**
 * 도감에서 카드를 꺼내 가방으로 돌립니다.
 *
 * @param no - 도감 번호 1~99
 */
export async function unregisterFromAlbum(no: number): Promise<AlbumResult> {
  await ensurePlayer();
  const jar = await cookies();
  const bag = readBag(jar);
  const album = readAlbum(decodeDex(jar.get(ALBUM.cookie)?.value, ALBUM.size));
  if (!isAlbumNo(no)) {
    return { ok: false, message: "도감에 없는 번호다.", bag, album };
  }
  const dex = dexForNo(no);
  if (!dex) {
    return { ok: false, message: "도감에 없는 번호다.", bag, album };
  }
  const flags = Buffer.from(decodeDex(jar.get(ALBUM.cookie)?.value, ALBUM.size));
  const slot = no - ALBUM.start;
  if (flags[slot] < 1) {
    return { ok: false, message: "아직 등록되지 않았다.", bag, album };
  }
  const counts = Buffer.from(decodeDex(jar.get(dex.cookie)?.value, dex.size));
  const index = dexIndex(dex, no);
  counts[index] = Math.min(BAG_COUNT_MAX, counts[index] + 1);
  flags[slot] = 0;
  await writeDex(dex, counts);
  await writeDex(ALBUM, flags);
  return {
    ok: true,
    message: "도감에서 꺼냈다.",
    bag: readBag(jar, { [dex.cookie]: counts }),
    album: readAlbum(flags),
  };
}

/**
 * 가방의 아이템 1개를 사용합니다. 서버 보유에서 빠지고 사용 기록에 남습니다.
 *
 * @param no - 아이템 번호
 */
export async function useBagItem(no: number): Promise<AlbumResult> {
  const playerId = await ensurePlayer();
  const jar = await cookies();
  const bag = readBag(jar);
  const album = readAlbum(decodeDex(jar.get(ALBUM.cookie)?.value, ALBUM.size));
  const item = lookupItem(no);
  if (!item.use) {
    return { ok: false, message: "사용할 수 없는 아이템이다.", bag, album };
  }
  const dex = dexForNo(no);
  if (!dex) {
    return { ok: false, message: "사용할 수 없는 아이템이다.", bag, album };
  }
  const counts = Buffer.from(decodeDex(jar.get(dex.cookie)?.value, dex.size));
  const index = dexIndex(dex, no);
  if (counts[index] < 1) {
    return { ok: false, message: "가진 아이템이 없다.", bag, album };
  }
  try {
    const held = (await getPlayerItemCount(playerId, no)) ?? 0;
    if (held < counts[index]) {
      const granted = await grantPlayerItem(playerId, no, counts[index] - held);
      if (!granted.ok) {
        return { ok: false, message: granted.message, bag, album };
      }
    }
    const used = await usePlayerItem(playerId, no);
    if (!used.ok) {
      return { ok: false, message: used.message, bag, album };
    }
  } catch {
    return { ok: false, message: "지금은 사용할 수 없다.", bag, album };
  }
  counts[index] -= 1;
  await writeDex(dex, counts);
  return {
    ok: true,
    message: usedMessage(no),
    bag: readBag(jar, { [dex.cookie]: counts }),
    album,
  };
}

function usedMessage(no: number) {
  if (no === DOTDOM_NO) return "희귀한 물고기가 더 잘 잡힌다.";
  return "사용했다.";
}

/**
 * 돗돔을 사용한 적 있으면 희귀 생선 가중치 배율을 줍니다. DB 사용 기록을 봅니다.
 */
export async function getRareCatchBoost() {
  const playerId = await ensurePlayer();
  try {
    if (await playerHasUsedItem(playerId, DOTDOM_NO)) return RARE_CATCH_BOOST;
  } catch {
    /* 테이블이 아직 없어도 기본 확률로 잡습니다. */
  }
  return 1;
}
