'use server';

import pool from "@/src/lib/db";
import { DELETE_FRIEND, INSERT_FRIEND, SELECT_FRIEND_COOLDOWN } from "./queries";
import { updateTag } from "next/cache";
import type { FriendActionResult } from "./types";

const COOLDOWN_MESSAGE = "일촌 해제 후 24시간이 지나야 다시 신청할 수 있습니다.";

/**
 * 일촌을 신청합니다. 해제 후 24시간이 지나지 않았으면 거절됩니다.
 *
 * @param formData - `user_email` (신청 대상 이메일)
 * @returns 성공 여부. 쿨다운이면 `success: false`와 안내 메시지
 */
export async function createFriend(formData: FormData): Promise<FriendActionResult> {
  const userEmail = formData.get("user_email") as string;

  const cooldown = await pool.query(SELECT_FRIEND_COOLDOWN, [userEmail]);
  if (cooldown.rows.length > 0) {
    return { success: false, message: COOLDOWN_MESSAGE };
  }

  await pool.query(INSERT_FRIEND, [userEmail]);
  updateTag("friends");
  return { success: true };
}

/**
 * 일촌을 해제합니다. 해제 시점부터 24시간 재신청 쿨다운이 시작됩니다.
 *
 * @param formData - `user_email` (해제할 사용자 이메일)
 * @returns 성공 여부. 대상이 없으면 `success: false`
 */
export async function deleteFriend(formData: FormData): Promise<FriendActionResult> {
  const userEmail = formData.get("user_email") as string;

  const result = await pool.query(DELETE_FRIEND, [userEmail]);
  if (result.rowCount === 0) {
    return { success: false, message: "일촌을 찾을 수 없습니다." };
  }

  updateTag("friends");
  return { success: true };
}
