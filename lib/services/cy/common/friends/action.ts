'use server';

import pool from "@/lib/db";
import { DELETE_FRIEND, INSERT_FRIEND, SELECT_FRIEND_COOLDOWN } from "./queries";
import { updateTag } from "next/cache";

const COOLDOWN_MESSAGE = "일촌 해제 후 24시간이 지나야 다시 신청할 수 있습니다.";

export async function createFriend(formData: FormData) {
  const userEmail = formData.get("user_email") as string;

  const cooldown = await pool.query(SELECT_FRIEND_COOLDOWN, [userEmail]);
  if (cooldown.rows.length > 0) {
    return { success: false, message: COOLDOWN_MESSAGE };
  }

  await pool.query(INSERT_FRIEND, [userEmail]);
  updateTag("friends");
  return { success: true };
}

export async function deleteFriend(formData: FormData) {
  const userEmail = formData.get("user_email") as string;

  const result = await pool.query(DELETE_FRIEND, [userEmail]);
  if (result.rowCount === 0) {
    return { success: false, message: "일촌을 찾을 수 없습니다." };
  }

  updateTag("friends");
  return { success: true };
}
