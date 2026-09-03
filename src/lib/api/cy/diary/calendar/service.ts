import "server-only";

import pool from "@/src/lib/db";
import { cacheTag } from "next/cache";
import { SELECT_DIARY_EVENTS } from "./queries";
import type { DiaryEventsResponse } from "./types";

/**
 * 다이어리 캘린더에 표시할 일정 목록을 조회합니다.
 *
 * @returns `{ events }` — 반복/종일 여부를 포함한 일정 배열
 */
export async function getDiaryEvents(): Promise<DiaryEventsResponse> {
  "use cache";
  cacheTag("diaryEvents");

  const list = await pool.query(SELECT_DIARY_EVENTS);

  return {
    events: list.rows,
  };
}
