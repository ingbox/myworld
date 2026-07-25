"use client";

import { NextReactP5Wrapper } from "@p5-wrapper/next";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createMemoSketch,
  type MemoTool,
} from "@/lib/cy/profile/keyword/createMemoSketch";

const MEMO_SKETCH = createMemoSketch();
const STORAGE_KEY = "cy-keyword-memo";
const PEN_COLORS = ["#1e293b", "#2563eb", "#dc2626"] as const;

type MemoPadProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function MemoPad({ open, onOpenChange }: MemoPadProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<MemoTool>("pen");
  const [penColor, setPenColor] = useState<string>(PEN_COLORS[0]);
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: 360 });
  const [clearToken, setClearToken] = useState(0);

  const measure = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    const width = Math.max(240, Math.floor(el.clientWidth));
    const height = Math.max(200, Math.floor(el.clientHeight));
    setCanvasSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }, []);

  useEffect(() => {
    if (!open) return;
    measure();
    const el = bodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, measure]);

  const handleClear = () => {
    if (!window.confirm("메모를 모두 지울까요?")) return;
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setClearToken((n) => n + 1);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          className="keyword-memo-fab"
          onClick={() => onOpenChange(true)}
          aria-label="메모장 열기"
        >
          📝 메모
        </button>
      )}

      {/* p5 unmount 방지 — 닫혀도 DOM 유지, CSS로만 숨김 */}
      <aside
        className={`keyword-memo-panel${open ? "" : " keyword-memo-panel--closed"}`}
        aria-label="퀴즈 메모장"
        aria-hidden={!open}
      >
        <header className="keyword-memo-header">
          <p className="keyword-memo-title">메모장</p>
          <button
            type="button"
            className="keyword-memo-close"
            onClick={handleClose}
            aria-label="메모장 닫기"
          >
            ✕
          </button>
        </header>

        <div className="keyword-memo-toolbar">
          <div className="keyword-memo-tools">
            <button
              type="button"
              className={tool === "pen" ? "is-active" : ""}
              onClick={() => setTool("pen")}
            >
              펜
            </button>
            <button
              type="button"
              className={tool === "eraser" ? "is-active" : ""}
              onClick={() => setTool("eraser")}
            >
              지우개
            </button>
            <button type="button" onClick={handleClear}>
              전체 지우기
            </button>
          </div>
          <div className="keyword-memo-colors">
            {PEN_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={penColor === color ? "is-active" : ""}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setPenColor(color);
                  setTool("pen");
                }}
                aria-label={`펜 색상 ${color}`}
              />
            ))}
          </div>
        </div>

        <div ref={bodyRef} className="keyword-memo-body">
          <NextReactP5Wrapper
            sketch={MEMO_SKETCH}
            tool={tool}
            penColor={penColor}
            penWeight={2.5}
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
            storageKey={STORAGE_KEY}
            clearToken={clearToken}
          />
        </div>
      </aside>
    </>
  );
}
