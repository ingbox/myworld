import "server-only";

import pool from "@/lib/db";
import { cacheTag } from "next/cache";
import { GET_ROOM_LIST } from "./queries";

export async function getRoomList() {
  "use cache";
  cacheTag("adminRoom");

  const result = await pool.query(GET_ROOM_LIST);
  return {
    result: result.rows,
  };
}