"use server";

import { auth } from "@/app/auth";
import type {
  KeywordNode,
  KeywordProgressState,
  KeywordSubmitResult,
} from "./types";
import {
  getNodeById,
  getUserIdByEmail,
  goBack,
  submitAnswer,
} from "./service";

/**
 * 키워드 미로 노드를 id로 조회합니다. 클라이언트에서 특정 칸을 열 때 사용합니다.
 *
 * @param nodeId - 노드 id. 유효하지 않으면 `null`
 * @returns 해당 노드. 없거나 id가 잘못되면 `null`
 */
export async function fetchKeywordNode(
  nodeId: number,
): Promise<KeywordNode | null> {
  if (!Number.isFinite(nodeId) || nodeId <= 0) return null;
  return getNodeById(nodeId);
}

/**
 * 키워드 미로 정답을 제출합니다. 로그인 사용자면 진행이 저장됩니다.
 *
 * @param nodeId - 답을 제출한 노드 id
 * @param answer - 사용자가 입력한 정답
 * @returns 정답 여부 및 다음 노드. 입력이 비어 있으면 `{ correct: false }`
 */
export async function submitKeywordAnswer(
  nodeId: number,
  answer: string,
): Promise<KeywordSubmitResult> {
  if (!Number.isFinite(nodeId) || !answer.trim()) {
    return { correct: false };
  }

  const session = await auth();
  const userId = session?.user?.email
    ? await getUserIdByEmail(session.user.email)
    : null;

  return submitAnswer(nodeId, answer, userId);
}

/**
 * 키워드 미로에서 한 칸 뒤로 갑니다. 로그인한 사용자만 가능합니다.
 *
 * @returns 이전 노드와 히스토리. 비로그인이거나 돌아갈 곳이 없으면 `null`
 */
export async function goBackKeyword(): Promise<KeywordProgressState | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const userId = await getUserIdByEmail(session.user.email);
  if (!userId) return null;

  return goBack(userId);
}
