import "server-only";

import pool from "@/lib/db";
import { cacheTag } from "next/cache";
import { SELECT_VISIT_COUNT } from "./queries";

export async function getVisitCount() {
  "use cache";
  cacheTag("visitCount");

  const result = await pool.query(SELECT_VISIT_COUNT);
  return result.rows[0] ?? null;

}