import "server-only";

import pool from "@/src/lib/db";
import { cacheTag } from "next/cache";
import { GET_ROOM_LIST } from "./queries";
import type { AdminRoomListResult, ChatRoomRecord } from "./types";

/**
 * 관리자 채팅방 목록을 최근 수정순으로 조회합니다. 삭제된 방은 제외합니다.
 *
 * @returns `{ result }` — 채팅방 레코드 배열
 */
export async function getRoomList(): Promise<AdminRoomListResult> {
  "use cache";
  cacheTag("adminRoom");

  const result = await pool.query(GET_ROOM_LIST);
  return {
    result: result.rows as ChatRoomRecord[],
  };
}