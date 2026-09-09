"use client";

import { spriteDrawStyle, type RoomSprite } from "@/src/util/main/room";

type Props = {
  sprite: RoomSprite;
  zIndex?: number;
};

export default function TileSprite({ sprite, zIndex }: Props) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        ...spriteDrawStyle(sprite),
        zIndex,
      }}
      aria-hidden
    />
  );
}
