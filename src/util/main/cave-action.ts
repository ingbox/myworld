"use server";

import { ensurePlayer } from "@/src/util/main/mark-game-started";
import {
  getCaveProgress as readCaveProgress,
  getCavePuzzle as readCavePuzzle,
  submitCaveAnswer as saveCaveAnswer,
} from "@/src/lib/api/main/service";
import type { CaveProgress, CavePuzzlePublic, CaveSolveResult } from "@/src/lib/api/main/types";

const EMPTY_PROGRESS: CaveProgress = { solved: [], puzzles: [] };

/**
 * 있는 관문과 푼 관문을 읽습니다. 테이블이 없어도 게임은 진행합니다.
 */
export async function getCaveProgress(): Promise<CaveProgress> {
  const playerId = await ensurePlayer();
  try {
    return await readCaveProgress(playerId);
  } catch {
    return EMPTY_PROGRESS;
  }
}

/**
 * 표지판 문제만 읽습니다. 정답은 내려주지 않습니다.
 *
 * @param gate - 관문 번호
 */
export async function getCavePuzzle(gate: number): Promise<CavePuzzlePublic | null> {
  try {
    return await readCavePuzzle(gate);
  } catch {
    return null;
  }
}

/**
 * 관문 답을 서버에서 맞춥니다.
 *
 * @param gate - 관문 번호
 * @param answer - 사용자가 친 답
 */
export async function submitCaveAnswer(gate: number, answer: string): Promise<CaveSolveResult> {
  const playerId = await ensurePlayer();
  try {
    return await saveCaveAnswer(playerId, gate, answer);
  } catch {
    return {
      ok: false,
      message: "지금은 확인할 수 없다.",
      already: false,
      last: false,
      ...EMPTY_PROGRESS,
    };
  }
}
