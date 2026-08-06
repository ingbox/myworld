"use server";

import { auth } from "@/app/auth";
import type {
  KeywordNode,
  KeywordProgressState,
  KeywordSubmitResult,
} from "@/lib/cy/profile/intro/keyword/types";
import {
  getNodeById,
  getUserIdByEmail,
  goBack,
  submitAnswer,
} from "./service";

export async function fetchKeywordNode(
  nodeId: number,
): Promise<KeywordNode | null> {
  if (!Number.isFinite(nodeId) || nodeId <= 0) return null;
  return getNodeById(nodeId);
}

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

export async function goBackKeyword(): Promise<KeywordProgressState | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const userId = await getUserIdByEmail(session.user.email);
  if (!userId) return null;

  return goBack(userId);
}
