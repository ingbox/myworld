"use client";

import { spriteDrawStyle, type RoomSprite } from "@/src/util/main/room";

type Props = {
  sprite: RoomSprite;
  zIndex?: number;
  onClick?: () => void;
};

export default function TileSprite({ sprite, zIndex, onClick }: Props) {
  return (
    <div
      className={`absolute ${onClick ? "pointer-events-auto cursor-pointer" : "pointer-events-none"}`}
      style={{
        ...spriteDrawStyle(sprite),
        zIndex,
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
