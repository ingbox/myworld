"use client";

import { useCallback, useEffect, useState } from "react";
import { type Dir } from "@/src/util/main/chip";
import {
  FISH_BITE_WINDOW_MS,
  FISH_CAST_MS,
  FISH_REEL_MS,
  pickCatch,
  randomBiteDelay,
  type FishingState,
} from "@/src/util/main/fish";

/**
 * 던지기 → 입질 대기 → 챔질 창 → 결과까지 낚시 흐름을 돌립니다.
 */
export function useFishing() {
  const [fishing, setFishing] = useState<FishingState | null>(null);

  const start = useCallback((facing: Dir) => {
    const now = performance.now();
    setFishing({
      phase: "cast",
      facing,
      startedAt: now,
      biteAt: now + FISH_CAST_MS + randomBiteDelay(),
      success: false,
      catch: null,
    });
  }, []);

  const hook = useCallback(() => {
    setFishing((current) => {
      if (!current) return current;
      if (current.phase === "wait") {
        return { ...current, phase: "reel", success: false, catch: null };
      }
      if (current.phase === "bite") {
        return { ...current, phase: "reel", success: true, catch: pickCatch() };
      }
      if (current.phase === "done") {
        return null;
      }
      return current;
    });
  }, []);

  const stop = useCallback(() => setFishing(null), []);

  useEffect(() => {
    if (!fishing) return;

    if (fishing.phase === "cast") {
      const id = window.setTimeout(() => {
        setFishing((current) =>
          current?.phase === "cast" ? { ...current, phase: "wait" } : current,
        );
      }, FISH_CAST_MS);
      return () => window.clearTimeout(id);
    }

    if (fishing.phase === "wait") {
      const delay = Math.max(0, fishing.biteAt - performance.now());
      const id = window.setTimeout(() => {
        setFishing((current) =>
          current?.phase === "wait" ? { ...current, phase: "bite" } : current,
        );
      }, delay);
      return () => window.clearTimeout(id);
    }

    if (fishing.phase === "bite") {
      const id = window.setTimeout(() => {
        setFishing((current) =>
          current?.phase === "bite" ? { ...current, phase: "reel", success: false, catch: null } : current,
        );
      }, FISH_BITE_WINDOW_MS);
      return () => window.clearTimeout(id);
    }

    if (fishing.phase === "reel") {
      const id = window.setTimeout(() => {
        setFishing((current) =>
          current?.phase === "reel" ? { ...current, phase: "done" } : current,
        );
      }, FISH_REEL_MS);
      return () => window.clearTimeout(id);
    }
  }, [fishing]);

  return { fishing, start, hook, stop };
}
