import "server-only";

import pool from "@/lib/db";
import { cacheTag } from "next/cache";
import { SELECT_PROFILE_IMAGE } from "./queries";

export async function getProfileImage(userEmail: string) {
  "use cache";
  cacheTag("profileImage");

  const result = await pool.query(
    SELECT_PROFILE_IMAGE,
    [userEmail]
  );

  return result.rows[0]?.image_url ?? null;
}