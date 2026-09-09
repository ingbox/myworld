"use client";

import type { PointerEvent } from "react";
import type { Dir } from "@/src/util/main/chip";

type Props = {
  onHoldStart: (dir: Dir) => void;
  onHoldEnd: (dir: Dir) => void;
};

const BUTTON =
  "flex h-12 w-12 touch-none items-center justify-center rounded-md bg-black/50 select-none active:bg-black/70";

const ARROW_ROTATE: Record<Dir, string> = {
  up: "rotate-0",
  right: "rotate-90",
  down: "rotate-180",
  left: "-rotate-90",
};

function Arrow({ dir }: { dir: Dir }) {
  return (
    <img
      src="/images/game/dpad-arrow.png"
      alt=""
      draggable={false}
      className={`pointer-events-none h-8 w-8 ${ARROW_ROTATE[dir]}`}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

export default function DPad({ onHoldStart, onHoldEnd }: Props) {
  const bind = (dir: Dir) => ({
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      onHoldStart(dir);
    },
    onPointerUp: () => onHoldEnd(dir),
    onPointerCancel: () => onHoldEnd(dir),
  });

  return (
    <div className="pointer-events-auto absolute bottom-6 left-6 z-50 grid grid-cols-3 grid-rows-2 gap-1">
      <span />
      <button type="button" className={BUTTON} aria-label="위" {...bind("up")}>
        <Arrow dir="up" />
      </button>
      <span />
      <button type="button" className={BUTTON} aria-label="왼쪽" {...bind("left")}>
        <Arrow dir="left" />
      </button>
      <button type="button" className={BUTTON} aria-label="아래" {...bind("down")}>
        <Arrow dir="down" />
      </button>
      <button type="button" className={BUTTON} aria-label="오른쪽" {...bind("right")}>
        <Arrow dir="right" />
      </button>
    </div>
  );
}
