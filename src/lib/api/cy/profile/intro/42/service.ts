import "server-only";
import pool from "@/src/lib/db";
import {
  GET_ASK_MESSAGES_LATEST,
  GET_ASK_MESSAGES_BEFORE,
  COUNT_ASK_USER_TODAY,
  GET_ASK_MESSAGES_FOR_AI,
  RESET_ASK_MESSAGES,
} from "./queries";
import type { AskMessage, AskRole } from "./types";

/**
 * Ask 42 대화 한 페이지를 조회합니다. 최신부터 가져온 뒤 시간순으로 뒤집습니다.
 *
 * @param userEmail - 대화를 조회할 사용자 이메일
 * @param before - 이 시각보다 이전 메시지를 가져옵니다. 없으면 최신부터입니다.
 * @param limit - 가져올 개수. 기본 20
 * @returns 오래된 메시지가 앞에 오는 Ask 메시지 목록
 */
export async function getAskMessagesPage(
  userEmail: string,
  before?: string,
  limit = 20,
) {
  const result = before
    ? await pool.query(GET_ASK_MESSAGES_BEFORE, [userEmail, before, limit])
    : await pool.query(GET_ASK_MESSAGES_LATEST, [userEmail, limit]);

  return result.rows.reverse() as AskMessage[];
}

/**
 * 오늘 해당 사용자가 보낸 Ask 42 질문 수를 셉니다. 일일 한도 계산에 사용합니다.
 *
 * @param userEmail - 사용자 이메일
 * @returns 오늘 사용한 질문 횟수
 */
export async function countAskUserToday(userEmail: string) {
  const result = await pool.query(COUNT_ASK_USER_TODAY, [userEmail]);
  return result.rows[0].count as number;
}

/**
 * OpenAI에 넘길 최근 대화만 조회합니다. (`role`, `content`)
 *
 * @param userEmail - 사용자 이메일
 * @param limit - 가져올 개수. 기본 20
 * @returns 모델에 넣을 메시지 배열
 */
export async function getAskMessagesForAi(userEmail: string, limit = 20) {
  const result = await pool.query(GET_ASK_MESSAGES_FOR_AI, [userEmail, limit]);
  return result.rows as { role: AskRole; content: string }[];
}

/**
 * 해당 사용자의 Ask 42 대화를 모두 초기화합니다.
 *
 * @param userEmail - 초기화할 사용자 이메일
 */
export async function resetAskMessagesByEmail(userEmail: string) {
  await pool.query(RESET_ASK_MESSAGES, [userEmail]);
}
