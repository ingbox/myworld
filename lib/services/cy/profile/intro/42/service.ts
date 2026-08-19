import "server-only";
import pool from "@/lib/db";
import {
  GET_ASK_MESSAGES_LATEST,
  GET_ASK_MESSAGES_BEFORE,
  COUNT_ASK_USER_TODAY,
  GET_ASK_MESSAGES_FOR_AI,
  RESET_ASK_MESSAGES,
} from "./queries";

export async function getAskMessagesPage(
  userEmail: string,
  before?: string,
  limit = 20,
) {
  const result = before
    ? await pool.query(GET_ASK_MESSAGES_BEFORE, [userEmail, before, limit])
    : await pool.query(GET_ASK_MESSAGES_LATEST, [userEmail, limit]);

  return result.rows.reverse();
}

export async function countAskUserToday(userEmail: string) {
  const result = await pool.query(COUNT_ASK_USER_TODAY, [userEmail]);
  return result.rows[0].count as number;
}
export async function getAskMessagesForAi(userEmail: string, limit = 20) {
  const result = await pool.query(GET_ASK_MESSAGES_FOR_AI, [userEmail, limit]);
  return result.rows as { role: "user" | "assistant"; content: string }[];
}

export async function resetAskMessagesByEmail(userEmail: string) {
  await pool.query(RESET_ASK_MESSAGES, [userEmail]);
}