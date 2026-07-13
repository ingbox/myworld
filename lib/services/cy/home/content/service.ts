import "server-only";

import pool from "@/lib/db";
import { SELECT_CONTENT_COUNT, SELECT_UPDATED_NEWS } from "./queries";
import { cacheTag } from "next/cache";

export async function getContentCount() {
  "use cache";
  cacheTag("contentCount");

  const result = await pool.query(SELECT_CONTENT_COUNT);

  const row = result.rows[0];

  return {
    photo: {
      total: Number(row.photo_total ?? 0),
      today: Number(row.photo_today ?? 0),
    },
    visitor: {
      total: Number(row.visitor_total ?? 0),
      today: Number(row.visitor_today ?? 0),
    },
    jukebox: {
      total: Number(row.jukebox_total ?? 0),
      today: Number(row.jukebox_today ?? 0),
    },
    board: {
      total: Number(row.board_total ?? 0),
      today: Number(row.board_today ?? 0),
    },
  };
}

export async function getUpdatedNews() {
  "use cache";
  cacheTag("updatedNews");

  const result = await pool.query(SELECT_UPDATED_NEWS);
  return result.rows;
}