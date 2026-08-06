"use server";

import { normalizeAnswer } from "@/lib/cy/profile/intro/keyword/normalizeAnswer";
import pool from "@/lib/db";
import {
  CLEAR_KEYWORD_START_NODES,
  INSERT_KEYWORD_NODE,
  INSERT_KEYWORD_ROUTE,
  SELECT_KEYWORD_NODE_LIST,
} from "./queries";

export type KeywordRouteInput = {
  answer: string;
  nextNodeId: number | null;
};

export async function getKeywordNodeList() {
  const result = await pool.query(SELECT_KEYWORD_NODE_LIST);
  return result.rows as { id: number; title: string | null; is_start: boolean }[];
}

export async function createKeywordNode({
  title,
  content,
  isStart,
  routes,
}: {
  title: string;
  content: string;
  isStart: boolean;
  routes: KeywordRouteInput[];
}) {
  const normalizedRoutes = routes
    .map((route) => ({
      answer: normalizeAnswer(route.answer),
      nextNodeId: route.nextNodeId,
    }))
    .filter((route) => route.answer.length > 0);

  if (normalizedRoutes.length === 0) {
    throw new Error("정답 분기를 1개 이상 입력해 주세요.");
  }

  const answers = new Set<string>();
  for (const route of normalizedRoutes) {
    if (answers.has(route.answer)) {
      throw new Error("같은 문제에 중복된 정답은 등록할 수 없습니다.");
    }
    answers.add(route.answer);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (isStart) {
      await client.query(CLEAR_KEYWORD_START_NODES);
    }

    const inserted = await client.query(INSERT_KEYWORD_NODE, [
      title.trim(),
      content,
      isStart,
    ]);
    const nodeId = inserted.rows[0].id as number;

    for (let i = 0; i < normalizedRoutes.length; i++) {
      const route = normalizedRoutes[i];
      await client.query(INSERT_KEYWORD_ROUTE, [
        nodeId,
        route.answer,
        route.nextNodeId,
        i,
      ]);
    }

    await client.query("COMMIT");
    return { success: true, nodeId };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createKeywordNode err:", err);
    if (err instanceof Error) throw err;
    throw new Error("키워드 문제 생성 실패");
  } finally {
    client.release();
  }
}
