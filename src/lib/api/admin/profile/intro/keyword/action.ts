"use server";

import { normalizeAnswer } from "@/src/util/cy/profile/intro/keyword/normalizeAnswer";
import pool from "@/src/lib/db";
import {
  CLEAR_KEYWORD_START_NODES,
  INSERT_KEYWORD_NODE,
  INSERT_KEYWORD_ROUTE,
  SELECT_KEYWORD_NODE_LIST,
} from "./queries";
import type {
  CreateKeywordNodeRequest,
  CreateKeywordNodeResult,
  KeywordNodeListItem,
} from "./types";

/**
 * 키워드 미로 노드 목록을 조회합니다. 관리자 에디터의 다음 노드 선택에 사용합니다.
 *
 * @returns `{ id, title, is_start }` 목록
 */
export async function getKeywordNodeList(): Promise<KeywordNodeListItem[]> {
  const result = await pool.query(SELECT_KEYWORD_NODE_LIST);
  return result.rows as KeywordNodeListItem[];
}

/**
 * 키워드 미로 노드와 정답 분기를 한 트랜잭션으로 생성합니다.
 * `isStart`가 true면 기존 시작 노드 표시를 해제합니다. 정답은 정규화되며 중복을 허용하지 않습니다.
 *
 * @param data - 노드 제목/본문, 시작 여부, 정답 분기 목록
 * @param data.title - 문제 제목
 * @param data.content - 문제 본문
 * @param data.isStart - 이 노드를 미로 시작점으로 둘지 여부
 * @param data.routes - `{ answer, nextNodeId }` 분기. 빈 정답은 제외됩니다.
 * @returns `{ success: true, nodeId }`
 * @throws 분기가 없거나 정답이 중복되거나 DB 저장에 실패한 경우
 */
export async function createKeywordNode({
  title,
  content,
  isStart,
  routes,
}: CreateKeywordNodeRequest): Promise<CreateKeywordNodeResult> {
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
