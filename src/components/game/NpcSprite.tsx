"use client";

import { useEffect, useState } from "react";
import { TILE, type Dir } from "@/src/util/main/chip";
import { npcIdleStyle } from "@/src/util/main/npc";

type Props = {
  px: number;
  py: number;
  facing: Dir;
  zIndex?: number;
};

const IDLE_MS = 280;

export default function NpcSprite({ px, py, facing, zIndex = 8 }: Props) {
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
      className="pointer-events-none absolute"
      style={{
        left: px,
        top: py,
        width: TILE,
        height: TILE,
        zIndex,
        ...npcIdleStyle(facing, frame),
      }}
      aria-hidden
    />
  );
}
