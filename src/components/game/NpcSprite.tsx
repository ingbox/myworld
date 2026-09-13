"use client";

import { useEffect, useState } from "react";
import { TILE, type Dir } from "@/src/util/main/chip";
import { npcIdleStyle } from "@/src/util/main/npc";

type Props = {
  px: number;
  py: number;
  facing: Dir;
  zIndex?: number;
  onClick?: () => void;
};

const IDLE_MS = 280;

export default function NpcSprite({ px, py, facing, zIndex = 8, onClick }: Props) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFrame((n) => (n + 1) % 4);
    }, IDLE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      data-entity="npc"
      className={`absolute ${onClick ? "pointer-events-auto cursor-pointer" : "pointer-events-none"}`}
      style={{
        left: px,
        top: py,
        width: TILE,
        height: TILE,
        zIndex,
        ...npcIdleStyle(facing, frame),
      }}
      aria-hidden={!onClick}
      role={onClick ? "button" : undefined}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
    />
  );
}
