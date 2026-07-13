import "server-only";

import { cacheTag } from "next/cache";
import pool from "@/lib/db";
import { GET_USER_STATS, UPDATE_USER_STATS } from "./queries";

export async function getUserStats() {
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
    return userStats;
}