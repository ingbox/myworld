'use server'

import pool from "@/lib/db";
import { updateTag } from "next/cache";
import { INSERT_PROFILE_COMMENT } from "./queries";

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