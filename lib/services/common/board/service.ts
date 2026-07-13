import "server-only";

import pool from "@/lib/db";
import { cacheTag } from "next/cache";
import { SELECT_PROFILE_IMAGE, SELECT_BOARD_TYPE } from "./queries";

export async function getProfileImage(userEmail: string) {
  "use cache";
  cacheTag("profileImage");

  const result = await pool.query(
    SELECT_PROFILE_IMAGE,
    [userEmail]
  );

  return result.rows[0]?.image_url ?? null;
}

export async function getBoardTypeList() {
  "use cache";
  cacheTag("boardType");

  const result = await pool.query(SELECT_BOARD_TYPE);

  return result.rows;
}