import "server-only";

import pool from "@/src/lib/db";
import { SELECT_CONTENT_COUNT, SELECT_UPDATED_NEWS } from "./queries";
import { cacheTag } from "next/cache";
import type { ContentCountData, UpdatedNewsData } from "./types";

/**
 * 사진첩·방명록·주크박스·게시판의 전체/오늘 작성 수를 조회합니다.
 * 홈 왼쪽 카운터에서 사용하며 `contentCount` 캐시를 사용합니다.
 *
 * @returns 섹션별 `{ total, today }`
 */
export async function getContentCount(): Promise<ContentCountData> {
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

/**
 * 홈에 보여줄 최근 업데이트 4건을 조회합니다.
 * 방명록·사진첩·게시판을 합쳐 최신순으로 자릅니다.
 *
 * @returns `{ id, content, created_at, type }` 목록. `type`은 `visitor` | `photo` | `board`
 */
export async function getUpdatedNews(): Promise<UpdatedNewsData[]> {
  "use cache";
  cacheTag("updatedNews");

  const result = await pool.query(SELECT_UPDATED_NEWS);
  return result.rows as UpdatedNewsData[];
}