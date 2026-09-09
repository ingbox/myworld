import { TILE } from "@/src/util/main/chip";
import catalog from "@/src/util/main/catalog.json";
import outdoorCatalog from "@/src/util/main/outdoor.json";
import interiorCatalog from "@/src/util/main/interior.json";
import bedroomLayout from "@/src/util/main/rooms/bedroom.json";
import livingLayout from "@/src/util/main/rooms/living.json";
import villageLayout from "@/src/util/main/rooms/village.json";
import galleryLayout from "@/src/util/main/rooms/gallery.json";
import seaLayout from "@/src/util/main/rooms/sea.json";
import { resolveNpcs, type NpcPlacement, type RoomNpc } from "@/src/util/main/npc";
import {
  resolveExhibits,
  type ExhibitPlacement,
  type RoomExhibit,
} from "@/src/util/main/exhibit";

export type SpriteLayer = "wall" | "floor" | "object";
export type BlockedMode = "all" | "bottom" | "none";
export type RoomKind = "indoor" | "outdoor";

export type PieceSrc = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type TilesetSheet = {
  src: string;
  width: number;
  height: number;
  tile: number;
};

export type CatalogPiece = {
  sheet?: string;
  src: PieceSrc;
  offset: { x: number; y: number };
  cols: number;
  rows: number;
  blocked: BlockedMode;
  /** blocked all/bottom 이어도 이 상대 칸은 지나갈 수 있습니다. 문 앞 등. */
  pass?: number[][];
  layer: SpriteLayer;
};

export type Opening = {
  col: number;
  row: number;
  cols: number;
  rows: number;
  to: string;
  spawnCol: number;
  spawnRow: number;
};

export type FloorFill = {
  sheet?: string;
  srcCol: number;
  srcRow: number;
  srcCols: number;
};

export type RoomLayout = {
  id: string;
  kind?: RoomKind;
  cols: number;
  rows: number;
  start: { col: number; row: number };
  walls: { north: number; south: number; west: number; east: number };
  wallColors?: { top: string; mid: string; edge: string };
  backdrop?: string;
  floor: FloorFill;
  objects: Array<{
    piece: string;
    col: number;
    row: number;
    /** 같은 조각을 가로로 반복합니다. */
    fillCols?: number;
    /** 같은 조각을 세로로 반복합니다. */
    fillRows?: number;
    /** 반복할 때 이 조각들을 번갈아 씁니다. */
    cycle?: string[];
  }>;
  openings?: Opening[];
  npcs?: NpcPlacement[];
  exhibits?: ExhibitPlacement[];
};

export type RoomSprite = CatalogPiece & {
  id: string;
  sheet: string;
  piece: string;
  col: number;
  row: number;
  blockedCells: Array<[number, number]>;
};

export type Room = Omit<RoomLayout, "objects" | "npcs" | "exhibits"> & {
  kind: RoomKind;
  openings: Opening[];
  sprites: RoomSprite[];
  npcs: RoomNpc[];
  exhibits: RoomExhibit[];
};

export const SHEETS: Record<string, TilesetSheet> = {
  room: {
    src: catalog.tileset,
    width: catalog.width,
    height: catalog.height,
    tile: catalog.tile,
  },
  classic: {
    src: "/images/game/classic-rpg.png",
    width: 320,
    height: 128,
    tile: 16,
  },
  woods: {
    src: "/images/game/woods.png",
    width: 352,
    height: 192,
    tile: 16,
  },
  "village-v2": {
    src: "/images/game/village-v2.png",
    width: 282,
    height: 276,
    tile: 16,
  },
  interior: {
    src: "/images/game/interior.png",
    width: 200,
    height: 200,
    tile: 16,
  },
  summer: {
    src: "/images/game/summer.png",
    width: 256,
    height: 256,
    tile: 16,
  },
};

const PIECES: Record<string, CatalogPiece> = {
  ...(catalog.pieces as Record<string, CatalogPiece>),
  ...(outdoorCatalog.pieces as Record<string, CatalogPiece>),
  ...(interiorCatalog.pieces as Record<string, CatalogPiece>),
};

function blockedCells(piece: CatalogPiece): Array<[number, number]> {
  const pass = new Set((piece.pass ?? []).map(([dc, dr]) => `${dc},${dr}`));
  const keep = (dc: number, dr: number) => !pass.has(`${dc},${dr}`);

  if (piece.blocked === "none") return [];
  if (piece.blocked === "bottom") {
    const dr = piece.rows - 1;
    return Array.from({ length: piece.cols }, (_, dc) => [dc, dr] as [number, number]).filter(
      ([dc, cellRow]) => keep(dc, cellRow),
    );
  }
  const cells: Array<[number, number]> = [];
  for (let dr = 0; dr < piece.rows; dr++) {
    for (let dc = 0; dc < piece.cols; dc++) {
      if (keep(dc, dr)) cells.push([dc, dr]);
    }
  }
  return cells;
}

/**
 * 시트에서 한 칸을 TILE 크기로 그릴 때 쓰는 배경 스타일입니다.
 *
 * @param sheet - 타일셋
 * @param srcCol - 시트 열
 * @param srcRow - 시트 행
 */
export function tileBackground(sheet: TilesetSheet, srcCol: number, srcRow: number) {
  const scale = TILE / sheet.tile;
  return {
    backgroundImage: `url(${sheet.src})`,
    backgroundRepeat: "no-repeat" as const,
    backgroundPosition: `-${srcCol * TILE}px -${srcRow * TILE}px`,
    backgroundSize: `${sheet.width * scale}px ${sheet.height * scale}px`,
    imageRendering: "pixelated" as const,
  };
}

/**
 * 오브젝트 조각을 월드 칸에 맞춰 그릴 위치·크기 스타일입니다.
 *
 * @param sprite - resolveRoom 이 만든 스프라이트
 */
export function spriteDrawStyle(sprite: RoomSprite) {
  const sheet = SHEETS[sprite.sheet] ?? SHEETS.room;
  const scale = TILE / sheet.tile;
  return {
    left: sprite.col * TILE + sprite.offset.x * scale,
    top: sprite.row * TILE + sprite.offset.y * scale,
    width: sprite.src.w * scale,
    height: sprite.src.h * scale,
    backgroundImage: `url(${sheet.src})`,
    backgroundRepeat: "no-repeat" as const,
    backgroundPosition: `-${sprite.src.x * scale}px -${sprite.src.y * scale}px`,
    backgroundSize: `${sheet.width * scale}px ${sheet.height * scale}px`,
    imageRendering: "pixelated" as const,
  };
}

/** village-v2 액자 구멍. 바깥 테두리에 안 겹치게 안쪽으로 맞춥니다. */
const FRAME_INNER = { x: 4, y: 4, w: 13, h: 16 };

/**
 * 액자 투명 구멍에 프로젝트 사진을 맞춥니다.
 */
export function exhibitCoverStyle(exhibit: RoomExhibit) {
  const piece = PIECES.frame;
  const sheet = SHEETS[piece?.sheet ?? "village-v2"] ?? SHEETS["village-v2"];
  const scale = TILE / sheet.tile;
  const offset = piece?.offset ?? { x: 5, y: 4 };
  return {
    left: exhibit.frameCol * TILE + (offset.x + FRAME_INNER.x) * scale,
    top: exhibit.frameRow * TILE + (offset.y + FRAME_INNER.y) * scale,
    width: FRAME_INNER.w * scale,
    height: FRAME_INNER.h * scale,
    backgroundImage: exhibit.cover ? `url(${exhibit.cover})` : undefined,
    backgroundSize: "cover" as const,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat" as const,
    imageRendering: "auto" as const,
  };
}

/**
 * 카탈로그 조각과 방 JSON을 합쳐 그릴 수 있는 방 데이터로 만듭니다.
 *
 * @param layout - rooms/*.json
 * @param pieces - 실내·야외 조각을 합친 카탈로그
 */
export function resolveRoom(
  layout: RoomLayout,
  pieces: Record<string, CatalogPiece> = PIECES,
): Room {
  const sprites: RoomSprite[] = [];
  let stamp = 0;
  for (const obj of layout.objects) {
    const fillCols = obj.fillCols ?? 1;
    const fillRows = obj.fillRows ?? 1;
    const cycle = obj.cycle?.length ? obj.cycle : [obj.piece];
    for (let dr = 0; dr < fillRows; dr++) {
      for (let dc = 0; dc < fillCols; dc++) {
        const pieceName = cycle[(dc + dr) % cycle.length];
        const piece = pieces[pieceName];
        if (!piece) {
          throw new Error(`카탈로그에 '${pieceName}' 조각이 없습니다.`);
        }
        sprites.push({
          id: `${pieceName}-${obj.col + dc}-${obj.row + dr}-${stamp}`,
          piece: pieceName,
          col: obj.col + dc,
          row: obj.row + dr,
          ...piece,
          sheet: piece.sheet ?? "room",
          blockedCells: blockedCells(piece),
        });
        stamp += 1;
      }
    }
  }

  const exhibitPlaces = layout.exhibits ?? [];
  const signPiece = pieces.sign;
  const framePiece = pieces.frame;
  for (const exhibit of exhibitPlaces) {
    if (framePiece) {
      sprites.push({
        id: `frame-${exhibit.id}`,
        piece: "frame",
        col: exhibit.frameCol,
        row: exhibit.frameRow,
        ...framePiece,
        sheet: framePiece.sheet ?? "village-v2",
        blockedCells: blockedCells(framePiece),
      });
    }
    if (signPiece) {
      sprites.push({
        id: `sign-${exhibit.id}`,
        piece: "sign",
        col: exhibit.signCol,
        row: exhibit.signRow,
        ...signPiece,
        sheet: signPiece.sheet ?? "village-v2",
        blockedCells: blockedCells(signPiece),
      });
    }
  }

  const {
    objects: _objects,
    openings = [],
    npcs: npcPlaces = [],
    exhibits: _exhibitPlaces = exhibitPlaces,
    ...rest
  } = layout;
  return {
    ...rest,
    kind: layout.kind ?? "indoor",
    openings,
    sprites,
    npcs: resolveNpcs(npcPlaces),
    exhibits: resolveExhibits(exhibitPlaces),
  };
}

export function isOpeningTile(room: Room, col: number, row: number) {
  return room.openings.some(
    (opening) =>
      col >= opening.col &&
      col < opening.col + opening.cols &&
      row >= opening.row &&
      row < opening.row + opening.rows,
  );
}

/**
 * 이 칸이 다른 방으로 이어지는 통로면 그 통로를 돌려줍니다.
 *
 * @param room - 현재 방
 * @param col - 열
 * @param row - 행
 */
export function findOpening(room: Room, col: number, row: number) {
  return room.openings.find(
    (opening) =>
      col >= opening.col &&
      col < opening.col + opening.cols &&
      row >= opening.row &&
      row < opening.row + opening.rows,
  );
}

export function isWallTile(room: Room, col: number, row: number) {
  if (isOpeningTile(room, col, row)) return false;
  const { west, east, north, south } = room.walls;
  if (col < west || col >= room.cols - east) return true;
  if (row < north || row >= room.rows - south) return true;
  return false;
}

/**
 * 벽·가구 발자국만 막힌 걷기 맵을 만듭니다.
 *
 * @param room - resolveRoom 결과
 * @returns walkable[row][col]
 */
export function buildWalkable(room: Room): boolean[][] {
  const grid = Array.from({ length: room.rows }, (_, row) =>
    Array.from({ length: room.cols }, (_, col) => !isWallTile(room, col, row)),
  );

  for (const sprite of room.sprites) {
    for (const [dc, dr] of sprite.blockedCells) {
      const col = sprite.col + dc;
      const row = sprite.row + dr;
      if (row < 0 || col < 0 || row >= room.rows || col >= room.cols) continue;
      grid[row][col] = false;
    }
  }

  for (const npc of room.npcs) {
    if (npc.row < 0 || npc.col < 0 || npc.row >= room.rows || npc.col >= room.cols) {
      continue;
    }
    grid[npc.row][npc.col] = false;
  }

  for (const exhibit of room.exhibits) {
    const { signCol, signRow } = exhibit;
    if (signRow < 0 || signCol < 0 || signRow >= room.rows || signCol >= room.cols) {
      continue;
    }
    grid[signRow][signCol] = false;
  }

  return grid;
}

export function spriteBottomY(sprite: RoomSprite) {
  return (sprite.row + sprite.rows) * TILE;
}

export const ROOMS: Record<string, Room> = {
  bedroom: resolveRoom(bedroomLayout as RoomLayout),
  living: resolveRoom(livingLayout as RoomLayout),
  village: resolveRoom(villageLayout as RoomLayout),
  gallery: resolveRoom(galleryLayout as RoomLayout),
  sea: resolveRoom(seaLayout as RoomLayout),
};

export const TILESET_SHEET = SHEETS.room;
