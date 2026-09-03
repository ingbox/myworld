"use server";

import pool from "@/src/lib/db";
import { CREATE_ROOM } from "./queries";
import type { ChatRoomRecord } from "./types";

/**
 * 사용자 이메일로 채팅방을 만들거나, 이미 있으면 그 방을 반환합니다.
 *
 * @param user_email - 방 주인 이메일
 * @returns 채팅방 레코드 (`id`, `user_email`, 생성/수정/삭제 시각)
 */
export async function createRoom(user_email: string) {
  const result = await pool.query(CREATE_ROOM, [user_email]);
  return result.rows[0] as ChatRoomRecord;
}
