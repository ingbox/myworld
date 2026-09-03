import "server-only";

import pool from "@/src/lib/db";
import { cacheTag } from "next/cache";
import { SELECT_VISIT_COUNT } from "./queries";
import type { VisitCountData } from "./types";

/**
 * 미니홈피 오늘/전체 방문 수를 조회합니다.
 *
 * @returns `today_count`, `total_count`. 집계 행이 없으면 `null`
 */
export async function getVisitCount(): Promise<VisitCountData | null> {
  "use cache";
  cacheTag("visitCount");

  const result = await pool.query(SELECT_VISIT_COUNT);
  return (result.rows[0] as VisitCountData | undefined) ?? null;
}