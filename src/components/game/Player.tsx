"use client";

import { playerBackground, TILE, type Dir } from "@/src/util/main/chip";

type Props = {
  px: number;
  py: number;
  facing: Dir;
  walkFrame: 0 | 1 | 2;
  zIndex?: number;
  entity?: "player" | "npc";
};

export default function Player({
  px,
  py,
  facing,
  walkFrame,
  zIndex = 10,
  entity = "player",
}: Props) {
  return (
    <div
      data-entity={entity}
      className="pointer-events-none absolute"
      style={{
        ...playerBackground(facing, walkFrame),
        left: px,
        top: py,
        width: TILE,
        height: TILE,
        zIndex,
      }}
      aria-hidden
    />
  );
}
