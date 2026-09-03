import "server-only";

import { cacheTag } from "next/cache";
import pool from "@/src/lib/db";
import { GET_USER_STATS } from "./queries";
import type { UserStatsDisplay } from "./types";

/**
 * 미니홈피 능력치(에로틱, 페이머스 등)와 직전 대비 증감을 조회합니다.
 * 현재는 user_id `1`(홈피 주인) 고정입니다.
 *
 * @returns 능력치별 `{ value, diff }`. 행이 없으면 `null`
 */
export async function getUserStats(): Promise<UserStatsDisplay | null> {
    "use cache";
    cacheTag("userStats");

    const userId = 1; // 추후 auth user id
    const result = await pool.query(
        GET_USER_STATS,
        [userId]
    );

    if (result.rows.length === 0) {
        return null;
    }
    const stats = result.rows[0];

    const userStats = Object.fromEntries(
        Object.keys(stats)
            .filter(key => !key.endsWith("_diff"))
            .filter(
                key =>
                    typeof stats[key as keyof typeof stats] === "number"

            )
            .map(key => [
                key,
                {
                    value: Number(
                        stats[key as keyof typeof stats]
                    ),
                    diff: Number(
                        stats[`${key}_diff` as keyof typeof stats] ?? 0
                    ),
                },
            ])
    );
    return userStats as UserStatsDisplay;
}