import "server-only";

import { normalizeAnswer } from "@/src/util/cy/profile/intro/keyword/normalizeAnswer";
import type {
  KeywordNode,
  KeywordProgressState,
  KeywordSubmitResult,
} from "./types";
import pool from "@/src/lib/db";
import {
  DELETE_KEYWORD_PROGRESS_BY_USER_ID,
  SELECT_NODE_BY_ID,
  SELECT_PROGRESS_BY_USER_ID,
  SELECT_ROUTES_BY_NODE_ID,
  SELECT_START_NODE,
  SELECT_USER_ID_BY_EMAIL,
  UPSERT_KEYWORD_PROGRESS,
} from "./queries";

export type { KeywordNode, KeywordProgressState, KeywordSubmitResult };

/**
 * `node_history` JSON/배열 값을 숫자 id 배열로 바꿉니다.
 *
 * @param value - DB에서 읽은 히스토리 값
 * @returns 숫자가 아닌 항목은 제외한 id 목록
 */
function parseHistory(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is number => typeof id === "number");
}

/**
 * 키워드 미로의 시작 노드를 조회합니다.
 *
 * @returns 시작 노드. 없으면 `null`
 */
export async function getStartNode(): Promise<KeywordNode | null> {
  const result = await pool.query(SELECT_START_NODE);
  return result.rows[0] ?? null;
}

/**
 * 키워드 미로 노드를 id로 조회합니다.
 *
 * @param id - 노드 id
 * @returns 해당 노드. 없으면 `null`
 */
export async function getNodeById(id: number): Promise<KeywordNode | null> {
  const result = await pool.query(SELECT_NODE_BY_ID, [id]);
  return result.rows[0] ?? null;
}

/**
 * 이메일로 사용자 id를 조회합니다. 키워드 진행 저장에 사용합니다.
 *
 * @param email - 사용자 이메일
 * @returns users.id. 없으면 `null`
 */
export async function getUserIdByEmail(
  email: string,
): Promise<number | null> {
  const result = await pool.query(SELECT_USER_ID_BY_EMAIL, [email]);
  return result.rows[0]?.id ?? null;
}

/**
 * 사용자 id 기준으로 현재 미로 위치와 이동 히스토리를 조회합니다.
 * 진행 기록이 없으면 시작 노드와 빈 히스토리를 반환합니다.
 *
 * @param userId - users.id
 * @returns 현재 노드와 히스토리. 시작 노드 자체가 없으면 `null`
 */
export async function getProgressForUserId(
  userId: number,
): Promise<KeywordProgressState | null> {
  const start = await getStartNode();
  if (!start) return null;

  const progress = await pool.query(SELECT_PROGRESS_BY_USER_ID, [userId]);
  const row = progress.rows[0];

  if (!row) {
    return { node: start, history: [] };
  }

  const history = parseHistory(row.node_history);
  const nodeId = row.current_node_id as number;
  const node = (await getNodeById(nodeId)) ?? start;

  return { node, history };
}

/**
 * 이메일 기준으로 키워드 미로 현재 상태를 조회합니다.
 * 비로그인·미가입이면 시작 노드에서 시작합니다.
 *
 * @param email - 로그인 사용자 이메일. 없으면 게스트로 취급합니다.
 * @returns 현재 노드와 히스토리. 시작 노드가 없으면 `null`
 */
export async function getCurrentStateByEmail(
  email?: string | null,
): Promise<KeywordProgressState | null> {
  const start = await getStartNode();
  if (!start) return null;

  if (!email) {
    return { node: start, history: [] };
  }

  const userId = await getUserIdByEmail(email);
  if (!userId) {
    return { node: start, history: [] };
  }

  return getProgressForUserId(userId);
}

/**
 * 이메일 기준으로 현재 노드만 조회합니다.
 *
 * @param email - 로그인 사용자 이메일
 * @returns 현재 노드. 없으면 `null`
 * @deprecated 히스토리까지 필요하면 {@link getCurrentStateByEmail}을 사용하세요.
 */
export async function getCurrentNodeByEmail(
  email?: string | null,
): Promise<KeywordNode | null> {
  const state = await getCurrentStateByEmail(email);
  return state?.node ?? null;
}

/**
 * 사용자 키워드 진행 히스토리만 읽습니다.
 *
 * @param userId - users.id
 * @returns 지금까지 지나온 노드 id 목록
 */
async function readHistory(userId: number): Promise<number[]> {
  const progress = await pool.query(SELECT_PROGRESS_BY_USER_ID, [userId]);
  return parseHistory(progress.rows[0]?.node_history);
}

/**
 * 현재 노드의 정답을 제출하고 다음 노드로 이동합니다.
 * 로그인 사용자면 진행 상태를 DB에 저장합니다. 마지막 정답이면 진행을 초기화합니다.
 *
 * @param nodeId - 답을 제출한 노드 id
 * @param rawAnswer - 사용자가 입력한 정답. 정규화 후 비교합니다.
 * @param userId - 진행을 저장할 users.id. 없으면 저장하지 않습니다.
 * @returns 정답 여부, 다음 노드, 클리어 여부, 히스토리
 */
export async function submitAnswer(
  nodeId: number,
  rawAnswer: string,
  userId?: number | null,
): Promise<KeywordSubmitResult> {
  const routes = await pool.query(SELECT_ROUTES_BY_NODE_ID, [nodeId]);
  const normalized = normalizeAnswer(rawAnswer);

  const match = routes.rows.find(
    (route) => normalizeAnswer(route.answer) === normalized,
  );
  if (!match) return { correct: false };

  const nextNodeId = match.next_node_id as number | null;

  if (nextNodeId === null) {
    if (userId) {
      await pool.query(DELETE_KEYWORD_PROGRESS_BY_USER_ID, [userId]);
    }
    return { correct: true, node: null, cleared: true, history: [] };
  }

  const nextNode = await getNodeById(nextNodeId);
  if (!nextNode) return { correct: false };

  if (userId) {
    const history = [...(await readHistory(userId)), nodeId];
    await pool.query(UPSERT_KEYWORD_PROGRESS, [userId, nextNodeId, history]);
    return { correct: true, node: nextNode, cleared: false, history };
  }

  return { correct: true, node: nextNode, cleared: false };
}

/**
 * 키워드 미로에서 바로 이전 노드로 돌아갑니다.
 *
 * @param userId - users.id
 * @returns 이전 노드와 줄어든 히스토리. 돌아갈 곳이 없으면 `null`
 */
export async function goBack(
  userId: number,
): Promise<KeywordProgressState | null> {
  const progress = await pool.query(SELECT_PROGRESS_BY_USER_ID, [userId]);
  const row = progress.rows[0];
  if (!row) return null;

  const history = parseHistory(row.node_history);
  if (history.length === 0) return null;

  const prevNodeId = history[history.length - 1];
  const newHistory = history.slice(0, -1);
  const node = await getNodeById(prevNodeId);
  if (!node) return null;

  await pool.query(UPSERT_KEYWORD_PROGRESS, [userId, prevNodeId, newHistory]);
  return { node, history: newHistory };
}
