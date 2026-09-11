import { CAVE_ROOM_COUNT, caveRoomId } from "@/src/util/main/cave";
import type { Opening, RoomLayout } from "@/src/util/main/room";

const COLS = 16;
const ROWS = 12;

type CaveObject = RoomLayout["objects"][number];

/**
 * 벽돌로 테두리를 두르고, 남쪽 출구 두 칸은 비웁니다.
 */
function brickBorder(southGapCol: number, southGapCols: number): CaveObject[] {
  const objects: CaveObject[] = [
    { piece: "dungeon-brick", col: 0, row: 0, fillCols: COLS },
    { piece: "dungeon-brick", col: 0, row: 1, fillRows: ROWS - 2 },
    { piece: "dungeon-brick", col: COLS - 1, row: 1, fillRows: ROWS - 2 },
  ];
  const southRow = ROWS - 1;
  if (southGapCol > 0) {
    objects.push({ piece: "dungeon-brick", col: 0, row: southRow, fillCols: southGapCol });
  }
  const after = southGapCol + southGapCols;
  if (after < COLS) {
    objects.push({
      piece: "dungeon-brick",
      col: after,
      row: southRow,
      fillCols: COLS - after,
    });
  }
  return objects;
}

/**
 * 던전 타일로 동굴 한 층을 만듭니다. 다음 방이 없어도 통로는 적어 두고, 열릴 때 막습니다.
 *
 * @param index - cave-0 부터
 */
export function buildCaveLayout(index: number): RoomLayout {
  const id = caveRoomId(index);
  const nextGate = index + 1;
  const even = index % 2 === 0;
  const southGapCol = 7;
  const southGapCols = 2;

  const objects: CaveObject[] = [
    ...brickBorder(southGapCol, southGapCols),
    {
      piece: even ? "dungeon-gate-blue" : "dungeon-gate-black",
      col: 12,
      row: 4,
    },
    { piece: "dungeon-sign", col: 13, row: 7, gate: nextGate },
    { piece: even ? "dungeon-pillar" : "dungeon-pillar-leaf", col: 3, row: 1 },
    { piece: even ? "dungeon-pillar-leaf" : "dungeon-pillar", col: 8, row: 1 },
    { piece: "dungeon-crystal", col: 2, row: 7 },
    { piece: even ? "dungeon-ice" : "dungeon-crystal", col: 5, row: 8 },
    { piece: even ? "dungeon-rock" : "dungeon-rock-gray", col: 4, row: 6 },
    { piece: even ? "dungeon-rock-gray" : "dungeon-rock", col: 10, row: 8 },
    { piece: "dungeon-obelisk", col: 10, row: 3 },
  ];

  const openings: Opening[] = [];

  if (index === 0) {
    openings.push({
      col: southGapCol,
      row: ROWS - 1,
      cols: southGapCols,
      rows: 1,
      to: "sea",
      spawnCol: 21,
      spawnRow: 4,
    });
  } else {
    objects.push({ piece: "dungeon-gate-black", col: 1, row: 4 });
    openings.push({
      col: 1,
      row: 4,
      cols: 3,
      rows: 2,
      to: caveRoomId(index - 1),
      spawnCol: 12,
      spawnRow: 7,
    });
  }

  openings.push({
    col: 12,
    row: 4,
    cols: 3,
    rows: 2,
    to: caveRoomId(nextGate),
    spawnCol: 4,
    spawnRow: 7,
    needGate: nextGate,
  });

  return {
    id,
    kind: "outdoor",
    cols: COLS,
    rows: ROWS,
    start: { col: 8, row: 9 },
    backdrop: even ? "#120c0a" : "#0e1014",
    walls: { north: 1, south: 1, west: 1, east: 1 },
    floor: { sheet: "dungeon-a2", srcCol: 1, srcRow: 5, srcCols: 1 },
    objects,
    openings,
  };
}

export const CAVE_LAYOUTS: RoomLayout[] = Array.from({ length: CAVE_ROOM_COUNT }, (_, index) =>
  buildCaveLayout(index),
);
