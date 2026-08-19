"use server";

import OpenAI from "openai";
import { auth } from "@/app/auth";
import pool from "@/lib/db";
import { JISUB_PROMPT } from "@/lib/cy/profile/intro/42/prompt";
import { INSERT_ASK_MESSAGE } from "./queries";
import {
  countAskUserToday,
  getAskMessagesForAi,
  getAskMessagesPage,
  resetAskMessagesByEmail,
} from "./service";

const DAILY_LIMIT = 10;

export async function fetchAskMessagesPage(before?: string) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("로그인이 필요합니다.");
  return getAskMessagesPage(email, before);
}

export async function sendAskMessage(content: string) {
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

  return { user: user.rows[0], assistant: assistant.rows[0] };
}

export async function getAskUsageToday() {
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

export async function resetAskMessages() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("로그인이 필요합니다.");

  await resetAskMessagesByEmail(email);
}