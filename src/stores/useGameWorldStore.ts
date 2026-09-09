import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type Dir } from "@/src/util/main/chip";
import { buildWalkable, ROOMS } from "@/src/util/main/room";

export type GameWorldSave = {
  roomId: string;
  col: number;
  row: number;
  facing: Dir;
};

type GameWorldStore = GameWorldSave & {
  remember: (next: GameWorldSave) => void;
};

const DIRS: Dir[] = ["down", "left", "right", "up"];

const FALLBACK: GameWorldSave = {
  roomId: "bedroom",
  col: ROOMS.bedroom.start.col,
  row: ROOMS.bedroom.start.row,
  facing: "down",
};

/**
 * 맵이 바뀌었거나 막힌 칸에 저장돼 있으면 그 방의 시작 칸으로 되돌립니다.
 */
export function sanitizeGameWorld(raw: Partial<GameWorldSave> | null | undefined): GameWorldSave {
  const roomId = typeof raw?.roomId === "string" && ROOMS[raw.roomId] ? raw.roomId : FALLBACK.roomId;
  const room = ROOMS[roomId];
  const facing = DIRS.includes(raw?.facing as Dir) ? (raw?.facing as Dir) : FALLBACK.facing;
  const col = Number.isInteger(raw?.col) ? (raw?.col as number) : room.start.col;
  const row = Number.isInteger(raw?.row) ? (raw?.row as number) : room.start.row;
  const walkable = buildWalkable(room);

  if (walkable[row]?.[col] !== true) {
    return { roomId, col: room.start.col, row: room.start.row, facing };
  }

  return { roomId, col, row, facing };
}

export const useGameWorldStore = create<GameWorldStore>()(
  persist(
    (set) => ({
      ...FALLBACK,
      remember: (next) => set(sanitizeGameWorld(next)),
    }),
    {
      name: "game-world",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ roomId, col, row, facing }) => ({ roomId, col, row, facing }),
      merge: (persisted, current) => ({
        ...current,
        ...sanitizeGameWorld(persisted as Partial<GameWorldSave>),
      }),
    },
  ),
);
