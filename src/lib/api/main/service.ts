import "server-only";

import pool from "@/src/lib/db";
import { lookupItem } from "@/src/util/main/item";
import { DOTDOM_NO } from "@/src/util/main/fish";
import {
  DECREMENT_PLAYER_ITEM,
  INSERT_ITEM_USE,
  LOCK_GAME_ITEM,
  LOCK_PLAYER_ITEM,
  SELECT_GAME_ITEM_BY_NO,
  SELECT_GAME_ITEM_LIST,
  SELECT_ITEM_CIRCULATING,
  SELECT_ITEM_USES,
  SELECT_PLAYER_HAS_ITEM,
  SELECT_PLAYER_HAS_USED_ITEM,
  SELECT_PLAYER_ITEMS,
  SELECT_PLAYER_USES,
  INSERT_PLAYER_CAVE,
  SELECT_CAVE_PUZZLE,
  SELECT_CAVE_PUZZLE_GATES,
  SELECT_PLAYER_CAVE_GATES,
  UPSERT_GAME_ITEM,
  UPSERT_GAME_PLAYER,
  UPSERT_PLAYER_ITEM,
} from "./queries";
import type {
  CaveProgress,
  CavePuzzlePublic,
  CaveSolveResult,
  GameItemRow,
  GameItemUseRow,
  GamePlayerItemRow,
  ItemMoveResult,
} from "./types";
import { hasCaveRoom, normalizeCaveAnswer } from "@/src/util/main/cave";

type ItemQueryRow = {
  no: number;
  name: string;
  can_use: boolean;
  can_album: boolean;
  max_count: number | null;
  max_per_player: number | null;
  count?: number;
};

function toItem(row: ItemQueryRow): GameItemRow {
  return {
    no: row.no,
    name: row.name,
    canUse: row.can_use,
    canAlbum: row.can_album,
    maxCount: row.max_count,
    maxPerPlayer: row.max_per_player,
  };
}

function toUse(row: { id: number; player_id: string; item_no: number; used_at: Date | string }): GameItemUseRow {
  return {
    id: row.id,
    playerId: row.player_id,
    itemNo: row.item_no,
    usedAt: typeof row.used_at === "string" ? row.used_at : row.used_at.toISOString(),
  };
}

function emptyMove(message: string): ItemMoveResult {
  return { ok: false, message, count: 0, playerHeld: 0, circulating: 0 };
}

/**
 * 쿠키 UUID를 게임 사용자로 남깁니다. 이미 있으면 마지막 접속만 갱신합니다.
 *
 * @param playerId - `game-started` 식별값
 */
export async function ensureGamePlayer(playerId: string) {
  await pool.query(UPSERT_GAME_PLAYER, [playerId]);
}

/**
 * 사용할 수 있거나 목록에 있는 아이템이면 `game_item`에 맞춰 둡니다.
 *
 * @param no - 아이템 번호
 */
export async function ensureCatalogItem(no: number): Promise<GameItemRow | null> {
  const def = lookupItem(no);
  if (def.use || def.album || def.maxCount !== null || def.maxPerPlayer !== null) {
    await pool.query(UPSERT_GAME_ITEM, [
      def.no,
      def.name,
      def.use,
      def.album,
      def.maxCount,
      def.maxPerPlayer,
    ]);
  }
  return getGameItem(no);
}

/**
 * 아이템 목록을 번호 순으로 읽습니다.
 */
export async function listGameItems(): Promise<GameItemRow[]> {
  const result = await pool.query(SELECT_GAME_ITEM_LIST);
  return (result.rows as ItemQueryRow[]).map(toItem);
}

/**
 * 번호로 아이템 한 줄을 읽습니다.
 *
 * @param no - 아이템 번호
 */
export async function getGameItem(no: number): Promise<GameItemRow | null> {
  const result = await pool.query(SELECT_GAME_ITEM_BY_NO, [no]);
  const row = result.rows[0] as ItemQueryRow | undefined;
  return row ? toItem(row) : null;
}

/**
 * 그 사용자가 가진 아이템만 읽습니다. 개수가 0이면 빼 둡니다.
 *
 * @param playerId - 게임 사용자 UUID
 */
export async function listPlayerItems(playerId: string): Promise<GamePlayerItemRow[]> {
  const result = await pool.query(SELECT_PLAYER_ITEMS, [playerId]);
  return (result.rows as ItemQueryRow[]).map((row) => ({
    ...toItem(row),
    count: row.count ?? 0,
  }));
}

/**
 * 그 사용자가 이 아이템을 가지고 있는지 봅니다.
 *
 * @param playerId - 게임 사용자 UUID
 * @param no - 아이템 번호
 */
export async function playerHasItem(playerId: string, no: number) {
  const count = await getPlayerItemCount(playerId, no);
  return (count ?? 0) > 0;
}

/**
 * 그 사용자의 보유 개수를 읽습니다. 줄을 아직 안 만들었으면 null입니다.
 *
 * @param playerId - 게임 사용자 UUID
 * @param no - 아이템 번호
 */
export async function getPlayerItemCount(playerId: string, no: number) {
  const result = await pool.query(SELECT_PLAYER_HAS_ITEM, [playerId, no]);
  const row = result.rows[0] as { count?: number } | undefined;
  if (!row) return null;
  return Number(row.count);
}

/**
 * 그 사용자가 이 아이템을 이미 사용했는지 봅니다. `game_item_use`를 읽습니다.
 *
 * @param playerId - 게임 사용자 UUID
 * @param no - 아이템 번호
 */
export async function playerHasUsedItem(playerId: string, no: number) {
  const result = await pool.query(SELECT_PLAYER_HAS_USED_ITEM, [playerId, no]);
  return result.rows.length > 0;
}

/**
 * 그 사용자가 사용한 기록을 읽습니다.
 *
 * @param playerId - 게임 사용자 UUID
 */
export async function listPlayerUses(playerId: string): Promise<GameItemUseRow[]> {
  const result = await pool.query(SELECT_PLAYER_USES, [playerId]);
  return result.rows.map(toUse);
}

/**
 * 이 아이템이 사용된 기록을 읽습니다.
 *
 * @param no - 아이템 번호
 */
export async function listItemUses(no: number): Promise<GameItemUseRow[]> {
  const result = await pool.query(SELECT_ITEM_USES, [no]);
  return result.rows.map(toUse);
}

/**
 * 사용자에게 아이템을 줍니다. 전역 한도와 본인 보유량을 비교해 막습니다.
 *
 * @param playerId - 게임 사용자 UUID
 * @param no - 아이템 번호
 * @param amount - 더할 개수. 기본 1
 */
export async function grantPlayerItem(
  playerId: string,
  no: number,
  amount = 1,
): Promise<ItemMoveResult> {
  if (amount < 1) return emptyMove("얻을 수 없다.");
  const exists = await ensureCatalogItem(no);
  if (!exists) return emptyMove("없는 아이템이다.");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(UPSERT_GAME_PLAYER, [playerId]);
    const locked = await client.query(LOCK_GAME_ITEM, [no]);
    const itemRow = locked.rows[0] as ItemQueryRow | undefined;
    if (!itemRow) {
      await client.query("ROLLBACK");
      return emptyMove("없는 아이템이다.");
    }
    const item = toItem(itemRow);
    const circ = await client.query(SELECT_ITEM_CIRCULATING, [no]);
    const circulating = Number((circ.rows[0] as { circulating: number }).circulating);
    const mine = await client.query(SELECT_PLAYER_HAS_ITEM, [playerId, no]);
    const playerHeld = Number((mine.rows[0] as { count?: number } | undefined)?.count ?? 0);

    if (item.maxPerPlayer !== null && playerHeld + amount > item.maxPerPlayer) {
      await client.query("ROLLBACK");
      return {
        ok: false,
        message: "더 이상 가질 수 없다.",
        count: playerHeld,
        playerHeld,
        circulating,
      };
    }
    if (item.maxCount !== null && circulating + amount > item.maxCount) {
      await client.query("ROLLBACK");
      return {
        ok: false,
        message: "더 이상 얻을 수 없다.",
        count: playerHeld,
        playerHeld,
        circulating,
      };
    }

    const granted = await client.query(UPSERT_PLAYER_ITEM, [playerId, no, amount]);
    const count = Number((granted.rows[0] as { count: number }).count);
    await client.query("COMMIT");
    return {
      ok: true,
      message: "얻었다.",
      count,
      playerHeld: count,
      circulating: circulating + amount,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 아이템 1개를 사용합니다. 보유에서 빼고 사용 기록에 남기면 다른 사람이 그 수량만큼 다시 얻을 수 있습니다.
 *
 * @param playerId - 게임 사용자 UUID
 * @param no - 아이템 번호
 */
export async function usePlayerItem(playerId: string, no: number): Promise<ItemMoveResult> {
  const item = await ensureCatalogItem(no);
  if (!item) return emptyMove("없는 아이템이다.");
  if (!item.canUse) return emptyMove("사용할 수 없는 아이템이다.");
  const def = lookupItem(no);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(UPSERT_GAME_PLAYER, [playerId]);
    await client.query(LOCK_GAME_ITEM, [no]);
    if (def.useOnce) {
      const usedRow = await client.query(SELECT_PLAYER_HAS_USED_ITEM, [playerId, no]);
      if (usedRow.rows.length > 0) {
        await client.query("ROLLBACK");
        return emptyMove("이미 사용했다.");
      }
    }
    const mine = await client.query(LOCK_PLAYER_ITEM, [playerId, no]);
    const playerHeld = Number((mine.rows[0] as { count?: number } | undefined)?.count ?? 0);
    if (playerHeld < 1) {
      await client.query("ROLLBACK");
      const circ = await client.query(SELECT_ITEM_CIRCULATING, [no]);
      return {
        ok: false,
        message: "가진 아이템이 없다.",
        count: 0,
        playerHeld: 0,
        circulating: Number((circ.rows[0] as { circulating: number }).circulating),
      };
    }
    const updated = await client.query(DECREMENT_PLAYER_ITEM, [playerId, no]);
    const count = Number((updated.rows[0] as { count: number }).count);
    await client.query(INSERT_ITEM_USE, [playerId, no]);
    const circ = await client.query(SELECT_ITEM_CIRCULATING, [no]);
    const circulating = Number((circ.rows[0] as { circulating: number }).circulating);
    await client.query("COMMIT");
    return {
      ok: true,
      message: no === DOTDOM_NO ? "희귀한 물고기가 더 잘 잡힌다." : "사용했다.",
      count,
      playerHeld: count,
      circulating,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

type CavePuzzleRow = {
  gate: number;
  prompt: string;
  answer: string;
};

function emptyCaveProgress(): CaveProgress {
  return { solved: [], puzzles: [] };
}

function emptyCaveSolve(message: string, progress: CaveProgress): CaveSolveResult {
  return { ok: false, message, already: false, last: false, ...progress };
}

async function readCaveProgress(playerId: string): Promise<CaveProgress> {
  const [puzzles, solved] = await Promise.all([
    pool.query(SELECT_CAVE_PUZZLE_GATES),
    pool.query(SELECT_PLAYER_CAVE_GATES, [playerId]),
  ]);
  return {
    puzzles: (puzzles.rows as { gate: number }[]).map((row) => Number(row.gate)),
    solved: (solved.rows as { gate: number }[]).map((row) => Number(row.gate)),
  };
}

function openedMessage(gate: number, puzzles: number[]) {
  if (!hasCaveRoom(gate)) {
    return "마지막 관문이 열렸다. 그 너머는 아직 막혀 있다. 보상은 아직 준비 중이다.";
  }
  if (!puzzles.includes(gate + 1)) {
    return "관문이 열렸다. 보상은 아직 준비 중이다.";
  }
  return "관문이 열렸다.";
}

/**
 * 있는 관문 번호와 이 사용자가 푼 관문을 읽습니다. 정답은 보내지 않습니다.
 *
 * @param playerId - 게임 사용자 UUID
 */
export async function getCaveProgress(playerId: string): Promise<CaveProgress> {
  return readCaveProgress(playerId);
}

/**
 * 표지판에 적을 문제만 읽습니다. 없으면 null입니다.
 *
 * @param gate - 관문 번호
 */
export async function getCavePuzzle(gate: number): Promise<CavePuzzlePublic | null> {
  if (!Number.isInteger(gate) || gate < 0) return null;
  const result = await pool.query(SELECT_CAVE_PUZZLE, [gate]);
  const row = result.rows[0] as CavePuzzleRow | undefined;
  if (!row) return null;
  return { gate: Number(row.gate), prompt: row.prompt };
}

/**
 * 관문 답을 맞춥니다. 다음 방·다음 문제가 없으면 넘어가지 못하게 안내합니다.
 *
 * @param playerId - 게임 사용자 UUID
 * @param gate - 관문 번호
 * @param answer - 사용자가 입력한 답
 */
export async function submitCaveAnswer(
  playerId: string,
  gate: number,
  answer: string,
): Promise<CaveSolveResult> {
  if (!Number.isInteger(gate) || gate < 0) {
    return emptyCaveSolve("표지판에 아무 글도 없다.", emptyCaveProgress());
  }

  const progress = await readCaveProgress(playerId);
  const puzzle = await pool.query(SELECT_CAVE_PUZZLE, [gate]);
  const row = puzzle.rows[0] as CavePuzzleRow | undefined;
  if (!row) {
    return emptyCaveSolve("표지판에 아무 글도 없다.", progress);
  }

  const already = progress.solved.includes(gate);
  const last = !progress.puzzles.includes(gate + 1) || !hasCaveRoom(gate);

  if (already) {
    return {
      ok: true,
      message: openedMessage(gate, progress.puzzles),
      already: true,
      last,
      ...progress,
    };
  }

  if (normalizeCaveAnswer(answer) !== normalizeCaveAnswer(row.answer)) {
    return emptyCaveSolve("아닌 것 같다.", progress);
  }

  await pool.query(UPSERT_GAME_PLAYER, [playerId]);
  await pool.query(INSERT_PLAYER_CAVE, [playerId, gate]);
  const next = await readCaveProgress(playerId);
  return {
    ok: true,
    message: openedMessage(gate, next.puzzles),
    already: false,
    last: !next.puzzles.includes(gate + 1) || !hasCaveRoom(gate),
    ...next,
  };
}
