"use server"

import pool from "@/lib/db";
import { GET_USER_STATS, UPDATE_USER_STATS } from "./queries";


export async function saveUserStats(stats: {
    erotic: number;
    famous: number;
    friendly: number;
    karma: number;
    kind: number;
    user_id?: number;
  }) {
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