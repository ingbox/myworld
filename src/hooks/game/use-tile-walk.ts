"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DIR_DELTA, STEP_MS, TILE, type Dir } from "@/src/util/main/chip";

type Options = {
  cols: number;
  rows: number;
  startCol: number;
  startRow: number;
  startFacing?: Dir;
  roomId?: string;
  tile?: number;
  stepMs?: number;
  canWalk?: (col: number, row: number) => boolean;
  onArrive?: (col: number, row: number) => boolean | void;
  /** true면 이동 입력을 무시합니다. 대화 중 등에 씁니다. */
  paused?: boolean;
};

function walkFrameAt(t: number): 0 | 1 | 2 {
  if (t < 0.25) return 1;
  if (t < 0.5) return 0;
  if (t < 0.75) return 1;
  return 2;
}

/**
 * 쯔꾸르식 타일 한 칸 이동을 다룹니다.
 * 걷는 중에는 입력을 하나만 큐에 넣고, 끝나면 idle 프레임으로 돌아갑니다.
 *
 * @param cols - 맵 가로 칸 수
 * @param rows - 맵 세로 칸 수
 * @param startCol - 시작 열
 * @param startRow - 시작 행
 * @returns 픽셀 좌표, 방향, 걷기 프레임, 홀드/탭 입력
 */
export function useTileWalk({
  cols,
  rows,
  startCol,
  startRow,
  startFacing = "down",
  roomId,
  tile = TILE,
  stepMs = STEP_MS,
  canWalk,
  onArrive,
  paused = false,
}: Options) {
  const [col, setCol] = useState(startCol);
  const [row, setRow] = useState(startRow);
  const [px, setPx] = useState(startCol * tile);
  const [py, setPy] = useState(startRow * tile);
  const [facing, setFacing] = useState<Dir>(startFacing);
  const [walkFrame, setWalkFrame] = useState<0 | 1 | 2>(1);
  const [isMoving, setIsMoving] = useState(false);

  const colRef = useRef(startCol);
  const rowRef = useRef(startRow);
  const movingRef = useRef(false);
  const queueRef = useRef<Dir | null>(null);
  const heldRef = useRef<Set<Dir>>(new Set());
  const rafRef = useRef<number>(0);
  const onArriveRef = useRef(onArrive);
  onArriveRef.current = onArrive;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const tryStartRef = useRef<(dir: Dir) => void>(() => {});

  const tryStart = useCallback(
    (dir: Dir) => {
      if (pausedRef.current || movingRef.current) return;

      setFacing(dir);
      const nextCol = colRef.current + DIR_DELTA[dir].dc;
      const nextRow = rowRef.current + DIR_DELTA[dir].dr;

      if (nextCol < 0 || nextCol >= cols || nextRow < 0 || nextRow >= rows) {
        return;
      }
      if (canWalk && !canWalk(nextCol, nextRow)) {
        return;
      }

      movingRef.current = true;
      setIsMoving(true);
      const fromX = colRef.current * tile;
      const fromY = rowRef.current * tile;
      const toX = nextCol * tile;
      const toY = nextRow * tile;
      const startedAt = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - startedAt) / stepMs);
        setPx(fromX + (toX - fromX) * t);
        setPy(fromY + (toY - fromY) * t);
        setWalkFrame(walkFrameAt(t));

        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        colRef.current = nextCol;
        rowRef.current = nextRow;
        setCol(nextCol);
        setRow(nextRow);
        setPx(toX);
        setPy(toY);
        setWalkFrame(1);
        movingRef.current = false;
        setIsMoving(false);

        const warped = onArriveRef.current?.(nextCol, nextRow);
        if (warped) {
          queueRef.current = null;
          return;
        }

        const queued = queueRef.current;
        queueRef.current = null;
        const nextHeld = queued ?? [...heldRef.current].at(-1);
        if (nextHeld) tryStart(nextHeld);
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [cols, rows, tile, stepMs, canWalk],
  );
  tryStartRef.current = tryStart;

  const requestMove = useCallback(
    (dir: Dir) => {
      if (pausedRef.current) {
        queueRef.current = null;
        return;
      }
      if (movingRef.current) {
        queueRef.current = dir;
        return;
      }
      tryStart(dir);
    },
    [tryStart],
  );

  const holdStart = useCallback(
    (dir: Dir) => {
      heldRef.current.add(dir);
      requestMove(dir);
    },
    [requestMove],
  );

  const holdEnd = useCallback((dir: Dir) => {
    heldRef.current.delete(dir);
  }, []);

  useLayoutEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    colRef.current = startCol;
    rowRef.current = startRow;
    setCol(startCol);
    setRow(startRow);
    setPx(startCol * tile);
    setPy(startRow * tile);
    setWalkFrame(1);
    movingRef.current = false;
    setIsMoving(false);
    queueRef.current = null;

    const held = [...heldRef.current].at(-1);
    if (!held) return;
    const id = requestAnimationFrame(() => tryStartRef.current(held));
    return () => cancelAnimationFrame(id);
  }, [roomId, startCol, startRow, tile]);

  useLayoutEffect(() => {
    setFacing(startFacing);
  }, [startFacing]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    col,
    row,
    px,
    py,
    facing,
    walkFrame,
    requestMove,
    holdStart,
    holdEnd,
    isMoving,
  };
}
