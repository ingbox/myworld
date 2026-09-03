import "server-only";

import pool from "@/src/lib/db";
import { cacheTag } from "next/cache";
import { SELECT_PROFILE_IMAGE, SELECT_BOARD_TYPE } from "./queries";
import type { BoardTypeData } from "./types";

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

/**
 * 게시판 종류 목록을 조회합니다. id가 `0`인 기본값은 제외합니다.
 *
 * @returns `{ id, name }` 형태의 종류 목록
 */
export async function getBoardTypeList(): Promise<BoardTypeData[]> {
  "use cache";
  cacheTag("boardType");

  const result = await pool.query(SELECT_BOARD_TYPE);

  return result.rows as BoardTypeData[];
}