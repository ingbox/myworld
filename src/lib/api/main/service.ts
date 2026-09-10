import "server-only";

import pool from "@/src/lib/db";
import { ITEM_BY_NO } from "@/src/util/main/item";
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
  SELECT_PLAYER_ITEMS,
  SELECT_PLAYER_USES,
  UPSERT_GAME_ITEM,
  UPSERT_GAME_PLAYER,
  UPSERT_PLAYER_ITEM,
} from "./queries";
import type {
  GameItemRow,
  GameItemUseRow,
  GamePlayerItemRow,
  ItemMoveResult,
} from "./types";

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
 * 목록에 있는 아이템이면 `game_item`에 맞춰 둡니다. 한도는 없어도 됩니다.
 *
 * @param no - 아이템 번호
 */
export async function ensureCatalogItem(no: number): Promise<GameItemRow | null> {
  const def = ITEM_BY_NO.get(no);
  if (def) {
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

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(UPSERT_GAME_PLAYER, [playerId]);
    await client.query(LOCK_GAME_ITEM, [no]);
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
      message: "사용했다.",
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
