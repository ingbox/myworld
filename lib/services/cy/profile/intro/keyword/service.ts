import "server-only";

import { normalizeAnswer } from "@/lib/cy/profile/intro/keyword/normalizeAnswer";
import type {
  KeywordNode,
  KeywordProgressState,
  KeywordSubmitResult,
} from "@/lib/cy/profile/intro/keyword/types";
import pool from "@/lib/db";
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

function parseHistory(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is number => typeof id === "number");
}

export async function getStartNode(): Promise<KeywordNode | null> {
  const result = await pool.query(SELECT_START_NODE);
  return result.rows[0] ?? null;
}

export async function getNodeById(id: number): Promise<KeywordNode | null> {
  const result = await pool.query(SELECT_NODE_BY_ID, [id]);
  return result.rows[0] ?? null;
}

export async function getUserIdByEmail(
  email: string,
): Promise<number | null> {
  const result = await pool.query(SELECT_USER_ID_BY_EMAIL, [email]);
  return result.rows[0]?.id ?? null;
}

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

/** @deprecated getCurrentStateByEmail 사용 */
export async function getCurrentNodeByEmail(
  email?: string | null,
): Promise<KeywordNode | null> {
  const state = await getCurrentStateByEmail(email);
  return state?.node ?? null;
}

async function readHistory(userId: number): Promise<number[]> {
  const progress = await pool.query(SELECT_PROGRESS_BY_USER_ID, [userId]);
  return parseHistory(progress.rows[0]?.node_history);
}

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
