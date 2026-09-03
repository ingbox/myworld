"use server";

import OpenAI from "openai";
import { auth } from "@/app/auth";
import pool from "@/src/lib/db";
import { JISUB_PROMPT } from "./prompt";
import { INSERT_ASK_MESSAGE } from "./queries";
import {
  countAskUserToday,
  getAskMessagesForAi,
  getAskMessagesPage,
  resetAskMessagesByEmail,
} from "./service";
import type { AskMessage, AskUsage, SendAskMessageResult } from "./types";

const DAILY_LIMIT = 10;

/**
 * 로그인한 사용자의 Ask 42 대화 한 페이지를 조회합니다.
 *
 * @param before - 이 시각보다 이전 메시지를 가져옵니다. 없으면 최신부터입니다.
 * @returns 시간순 Ask 메시지 목록
 * @throws 로그인하지 않은 경우
 */
export async function fetchAskMessagesPage(before?: string) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("로그인이 필요합니다.");
  return getAskMessagesPage(email, before);
}

/**
 * Ask 42에 질문을 보내고 GPT 답변을 저장합니다.
 * 하루 질문 한도는 10회입니다. 모델 호출이 실패해도 안내 문구를 답으로 남깁니다.
 *
 * @param content - 사용자 질문. 앞뒤 공백은 제거됩니다.
 * @returns 저장된 사용자 메시지와 어시스턴트 메시지
 * @throws 비로그인, 빈 내용, 일일 한도 초과
 */
export async function sendAskMessage(content: string): Promise<SendAskMessageResult> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("로그인이 필요합니다.");

  const text = content.trim();
  if (!text) throw new Error("내용을 입력하세요.");

  const used = await countAskUserToday(email);
  if (used >= DAILY_LIMIT) {
    throw new Error("오늘은 질문을 10번 모두 사용했어요. 내일 다시 와주세요.");
  }

  const history = await getAskMessagesForAi(email);

  const user = await pool.query(INSERT_ASK_MESSAGE, [email, "user", text]);

  let reply = "지금은 답을 만들지 못했어요. 잠시 후 다시 시도해 주세요.";

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: JISUB_PROMPT },
        ...history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: text },
      ],
    });

    reply = completion.choices[0]?.message?.content?.trim() || reply;
  } catch (error) {
    console.error("OpenAI error", error);
  }

  const assistant = await pool.query(INSERT_ASK_MESSAGE, [
    email,
    "assistant",
    reply,
  ]);

  return {
    user: user.rows[0] as AskMessage,
    assistant: assistant.rows[0] as AskMessage,
  };
}

/**
 * 오늘 Ask 42 질문 사용량(사용/한도/남은 횟수)을 조회합니다.
 *
 * @returns `{ used, limit, remaining }`
 * @throws 로그인하지 않은 경우
 */
export async function getAskUsageToday(): Promise<AskUsage> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("로그인이 필요합니다.");

  const used = await countAskUserToday(email);
  return {
    used,
    limit: DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - used),
  };
}

/**
 * 로그인한 사용자의 Ask 42 대화를 모두 초기화합니다.
 *
 * @throws 로그인하지 않은 경우
 */
export async function resetAskMessages() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("로그인이 필요합니다.");

  await resetAskMessagesByEmail(email);
}
