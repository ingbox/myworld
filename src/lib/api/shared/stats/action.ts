"use server"

import pool from "@/src/lib/db";
import { GET_USER_STATS, UPDATE_USER_STATS } from "./queries";
import type { SaveUserStatsRequest } from "./types";


/**
 * 미니홈피 능력치를 저장합니다. 이전 값과 비교해 `_diff`도 함께 갱신합니다.
 *
 * @param stats - 다섯 능력치 값. `user_id`가 없으면 `1`로 저장합니다.
 * @returns `{ success: true }`
 * @throws 해당 user_id의 `user_stats` 행이 없는 경우
 */
export async function saveUserStats(stats: SaveUserStatsRequest) {
    const userId = stats.user_id ?? 1;
    const prevResult = await pool.query(
      GET_USER_STATS,
      [userId]
    );
  
    if (prevResult.rows.length === 0) {
      throw new Error("user_stats 없음");
    }
  
    const prev = prevResult.rows[0];
    await pool.query(
      UPDATE_USER_STATS,
      [
        stats.erotic,
        stats.famous,
        stats.friendly,
        stats.karma,
        stats.kind,
        prev.erotic,
        prev.famous,
        prev.friendly,
        prev.karma,
        prev.kind,
        userId,
      ]
    );
  
    return {
      success: true
    };
  }