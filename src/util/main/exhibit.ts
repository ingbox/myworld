import { DIR_DELTA, type Dir } from "@/src/util/main/chip";
import projectCatalog from "@/src/util/main/projects.json";

export type ProjectDef = {
  title: string;
  label?: string;
  summary: string[];
  cover?: string;
  accent?: string;
  url: string;
};

export type ExhibitPlacement = {
  id: string;
  frameCol: number;
  frameRow: number;
  signCol: number;
  signRow: number;
};

export type RoomExhibit = ProjectDef & ExhibitPlacement;

/**
 * 프로젝트 카탈로그와 전시장 배치를 합칩니다.
 *
 * @param placements - 방 JSON 의 exhibits
 */
export function resolveExhibits(placements: ExhibitPlacement[] = []): RoomExhibit[] {
  const catalog = projectCatalog as Record<string, ProjectDef>;
  return placements.map((place) => {
    const def = catalog[place.id];
    if (!def) {
      throw new Error(`프로젝트 카탈로그에 '${place.id}'가 없습니다.`);
    }
    return { ...def, ...place, summary: def.summary.slice(0, 3) };
  });
}

/** 외부 링크가 있을 때만 이동 안내를 띄웁니다. */
export function hasProjectUrl(url: string | undefined) {
  return Boolean(url?.trim());
}

/**
 * 지금 바라보는 칸에 있는 표지판을 찾습니다.
 */
export function findExhibitInFront(
  exhibits: RoomExhibit[],
  col: number,
  row: number,
  facing: Dir,
) {
  const nextCol = col + DIR_DELTA[facing].dc;
  const nextRow = row + DIR_DELTA[facing].dr;
  return exhibits.find(
    (exhibit) => exhibit.signCol === nextCol && exhibit.signRow === nextRow,
  );
}

/**
 * 표지판과 플레이어가 상하좌우로 붙어 있는지 봅니다.
 */
export function isAdjacentExhibit(exhibit: RoomExhibit, col: number, row: number) {
  return Math.abs(exhibit.signCol - col) + Math.abs(exhibit.signRow - row) === 1;
}

/**
 * 외부면 새 탭, 내부 경로면 같은 창에서 엽니다.
 */
export function openProjectUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return;
  if (/^https?:\/\//i.test(trimmed)) {
    window.open(trimmed, "_blank", "noopener,noreferrer");
    return;
  }
  window.location.assign(trimmed);
}
