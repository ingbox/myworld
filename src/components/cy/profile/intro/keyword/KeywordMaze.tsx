"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import KeywordContent from "@/components/cy/profile/intro/keyword/KeywordContent";
import { KeywordMazeCardSkeleton } from "@/components/cy/profile/intro/keyword/KeywordMazeCardSkeleton";
import KeywordMazeShell from "@/components/cy/profile/intro/keyword/KeywordMazeShell";
import MemoPad from "@/components/cy/profile/intro/keyword/MemoPad";
import type { KeywordNode } from "@/src/util/cy/profile/intro/keyword/types";
import {
  fetchKeywordNode,
  goBackKeyword,
  submitKeywordAnswer,
} from "@/src/lib/api/cy/profile/intro/keyword/action";

const STORAGE_KEY = "keyword-current-node-id";
const HISTORY_STORAGE_KEY = "keyword-node-history";

type KeywordMazeProps = {
  initialNode: KeywordNode;
  initialHistory: number[];
  isLoggedIn: boolean;
};

function readStoredHistory(): number[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => typeof id === "number");
  } catch {
    return [];
  }
}

export default function KeywordMaze({
  initialNode,
  initialHistory,
  isLoggedIn,
}: KeywordMazeProps) {
  const [ready, setReady] = useState(isLoggedIn);
  const [memoOpen, setMemoOpen] = useState(false);
  const [node, setNode] = useState(initialNode);
  const [history, setHistory] = useState(initialHistory);
  const [answer, setAnswer] = useState("");
  const [cleared, setCleared] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [goingBack, setGoingBack] = useState(false);

  const persistProgress = useCallback(
    (nodeId: number | null, nodeHistory: number[]) => {
      if (isLoggedIn) return;
      if (nodeId === null) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        return;
      }
      localStorage.setItem(STORAGE_KEY, String(nodeId));
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nodeHistory));
    },
    [isLoggedIn],
  );

  useLayoutEffect(() => {
    if (isLoggedIn) return;

    const savedNodeId = localStorage.getItem(STORAGE_KEY);
    if (!savedNodeId) {
      setReady(true);
      return;
    }

    const nodeId = Number(savedNodeId);
    if (!Number.isFinite(nodeId) || nodeId === initialNode.id) {
      setReady(true);
      return;
    }

    const savedHistory = readStoredHistory();

    let cancelled = false;

    fetchKeywordNode(nodeId)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setNode(data);
          setHistory(savedHistory);
        }
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(HISTORY_STORAGE_KEY);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, initialNode.id]);

  const handleSubmit = async () => {
    if (submitting || cleared || !answer.trim()) return;

    setSubmitting(true);
    try {
      const result = await submitKeywordAnswer(node.id, answer);
      if (!result.correct) {
        setAnswer("");
        return;
      }

      setAnswer("");

      if (result.cleared) {
        setCleared(true);
        setHistory([]);
        persistProgress(null, []);
        return;
      }

      if (result.node) {
        const nextHistory = isLoggedIn
          ? (result.history as number[] | undefined) ?? [...history, node.id]
          : [...history, node.id];

        setHistory(nextHistory);
        setNode(result.node);
        persistProgress(result.node.id, nextHistory);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = async () => {
    if (goingBack || cleared || history.length === 0) return;

    setGoingBack(true);
    try {
      if (isLoggedIn) {
        const state = await goBackKeyword();
        if (!state) return;

        setNode(state.node);
        setHistory(state.history);
        setAnswer("");
        return;
      }

      const prevNodeId = history[history.length - 1];
      const nextHistory = history.slice(0, -1);

      const prevNode = await fetchKeywordNode(prevNodeId);
      if (!prevNode) return;
      setNode(prevNode);
      setHistory(nextHistory);
      setAnswer("");
      persistProgress(prevNode.id, nextHistory);
    } finally {
      setGoingBack(false);
    }
  };

  const canGoBack = !cleared && history.length > 0;

  if (!ready) {
    return (
      <div className="keyword-maze-root">
        <KeywordMazeShell>
          <KeywordMazeCardSkeleton />
        </KeywordMazeShell>
        <MemoPad open={memoOpen} onOpenChange={setMemoOpen} />
      </div>
    );
  }

  return (
    <div className="keyword-maze-root">
      <KeywordMazeShell>
        <div className="keyword-maze-card">
          {cleared ? (
            <p className="keyword-maze-clear">미궁을 클리어했습니다!</p>
          ) : (
            <>
              <span className="keyword-maze-stage">
                {node.title ?? `STAGE ${node.id}`}
              </span>
              <div className="keyword-maze-content max-h-56 overflow-scroll">
                <KeywordContent key={node.id} content={node.content} />
              </div>
              <input
                type="text"
                className="keyword-maze-input"
                placeholder="정답 입력"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSubmit();
                }}
                aria-label="정답 입력"
              />
              <div className="keyword-maze-actions">
                <button
                  type="button"
                  className="keyword-maze-back"
                  onClick={() => void handleBack()}
                  disabled={!canGoBack || goingBack || submitting}
                >
                  이전 문제
                </button>
                <button
                  type="button"
                  className="keyword-maze-submit"
                  onClick={() => void handleSubmit()}
                  disabled={submitting || !answer.trim()}
                >
                  확인
                </button>
              </div>
            </>
          )}
        </div>
      </KeywordMazeShell>

      <MemoPad open={memoOpen} onOpenChange={setMemoOpen} />
    </div>
  );
}
