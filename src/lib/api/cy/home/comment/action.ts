'use server'

import pool from "@/src/lib/db";
import { updateTag } from "next/cache";
import { INSERT_PROFILE_COMMENT, DELETE_PROFILE_COMMENT } from "./queries";

/**
 * 홈 일촌평을 작성합니다. `profileComment` 캐시를 갱신합니다.
 *
 * @param formData - `user_email`, `user_name`, `content`
 * @returns 방금 넣은 일촌평 행
 */
export async function createProfileComment(formData: FormData) {
  const data = {
    user_email: formData.get("user_email") as string,
    user_name: formData.get("user_name") as string,
    content: formData.get("content") as string,
  };

  const result = await pool.query(
    INSERT_PROFILE_COMMENT,
    [
      data.user_email,
      data.user_name,
      data.content,
    ]
  );
  
  updateTag("profileComment");
  return result.rows[0];
}

/**
 * 홈 일촌평을 소프트 삭제합니다. (`deleted_at` 기록)
 *
 * @param commentId - 삭제할 일촌평 id
 * @throws 삭제에 실패한 경우
 */
export async function deleteProfileComment(commentId: string) {
  try {
    await pool.query(
      DELETE_PROFILE_COMMENT,
      [commentId]
    );
    updateTag("profileComment");
  } catch (error) {
    console.error("deleteComment error:", error);
    throw new Error("댓글 삭제 실패");
  }
}