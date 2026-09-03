import "server-only";

import pool from "@/src/lib/db";
import { cacheTag } from "next/cache";
import { SELECT_PROFILE_IMAGE } from "./queries";

/**
 * 사용자 프로필 이미지 URL을 조회합니다.
 *
 * @param userEmail - 사용자 이메일
 * @returns 이미지 URL. 없으면 `null`
 */
export async function getProfileImage(userEmail: string) {
  "use cache";
  cacheTag("profileImage");

  const result = await pool.query(
    SELECT_PROFILE_IMAGE,
    [userEmail]
  );

  return result.rows[0]?.image_url ?? null;
}