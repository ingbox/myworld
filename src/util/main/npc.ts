import { BODY_DIR, DIR_DELTA, type Dir } from "@/src/util/main/chip";
import npcCatalog from "@/src/util/main/npcs.json";

export type LineJson = string | { text: string; balloon?: string };

export type DialogueLine = {
  text: string;
  balloon?: string;
};

export type NpcDef = {
  name: string;
  facing?: Dir;
  lines: LineJson[];
};

export type RoomNpc = Omit<NpcDef, "lines"> & {
  id: string;
  col: number;
  row: number;
  facing: Dir;
  lines: DialogueLine[];
};

export type NpcPlacement = {
  id: string;
  col: number;
  row: number;
  facing?: Dir;
};

/** 16x32 캐릭터 베이스. 칸은 32x32, 4열 5행(아래·대각·옆·대각뒤·위). */
export const NPC_IDLE = {
  src: "/images/game/npc-idle.png",
  width: 128,
  height: 160,
  cols: 4,
  rows: 5,
  frame: 32,
} as const;

/**
 * 대사 JSON을 텍스트·말풍선 형태로 맞춥니다.
 *
 * @param line - 문자열 또는 { text, balloon }
 */
export function resolveLine(line: LineJson): DialogueLine {
  if (typeof line === "string") return { text: line };
  return { text: line.text, balloon: line.balloon };
}

/**
 * NPC 카탈로그와 방 배치를 합칩니다.
 *
 * @param placements - 방 JSON 의 npcs
 */
export function resolveNpcs(placements: NpcPlacement[] = []): RoomNpc[] {
  const catalog = npcCatalog as Record<string, NpcDef>;
  return placements.map((place) => {
    const def = catalog[place.id];
    if (!def) {
      throw new Error(`NPC 카탈로그에 '${place.id}'가 없습니다.`);
    }
    return {
      ...def,
      id: place.id,
      col: place.col,
      row: place.row,
      facing: place.facing ?? def.facing ?? "down",
      lines: def.lines.map(resolveLine),
    };
  });
}

/**
 * 지금 바라보는 칸에 있는 NPC를 찾습니다.
 *
 * @param npcs - 이 방의 NPC
 * @param col - 플레이어 열
 * @param row - 플레이어 행
 * @param facing - 바라보는 방향
 */
export function findNpcInFront(
  npcs: RoomNpc[],
  col: number,
  row: number,
  facing: Dir,
) {
  const nextCol = col + DIR_DELTA[facing].dc;
  const nextRow = row + DIR_DELTA[facing].dr;
  return npcs.find((npc) => npc.col === nextCol && npc.row === nextRow);
}

/**
 * NPC와 플레이어가 상하좌우로 붙어 있는지 봅니다.
 */
export function isAdjacentNpc(npc: RoomNpc, col: number, row: number) {
  return Math.abs(npc.col - col) + Math.abs(npc.row - row) === 1;
}

function npcFrameStyle(dir: Dir, frame: number) {
  const { row } = BODY_DIR[dir];
  const col = ((frame % NPC_IDLE.cols) + NPC_IDLE.cols) % NPC_IDLE.cols;
  const size = NPC_IDLE.frame;
  return {
    backgroundImage: `url(${NPC_IDLE.src})`,
    backgroundRepeat: "no-repeat" as const,
    backgroundSize: `${NPC_IDLE.width}px ${NPC_IDLE.height}px`,
    backgroundPosition: `-${col * size}px -${row * size}px`,
    imageRendering: "pixelated" as const,
  };
}

/**
 * idle 시트의 방향·프레임 배경 스타일입니다.
 *
 * @param dir - 바라보는 방향
 * @param frame - idle 열 0~3
 */
export function npcIdleStyle(dir: Dir, frame: number) {
  const { flip } = BODY_DIR[dir];
  return {
    ...npcFrameStyle(dir, frame),
    transform: flip ? "scaleX(-1)" : undefined,
  };
}

export function npcPortraitStyle(_npc: RoomNpc) {
  return npcFrameStyle("down", 0);
}
