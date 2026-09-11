export type GameItemRow = {
  no: number;
  name: string;
  canUse: boolean;
  canAlbum: boolean;
  /** 세상에 동시에 존재할 수 있는 개수. null이면 한도 없음 */
  maxCount: number | null;
  /** 한 사람이 가질 수 있는 개수. null이면 한도 없음 */
  maxPerPlayer: number | null;
};

export type GamePlayerItemRow = GameItemRow & {
  count: number;
};

export type GameItemUseRow = {
  id: number;
  playerId: string;
  itemNo: number;
  usedAt: string;
};

export type ItemMoveResult = {
  ok: boolean;
  message: string;
  count: number;
  playerHeld: number;
  circulating: number;
};

export type CavePuzzlePublic = {
  gate: number;
  prompt: string;
};

export type CaveProgress = {
  solved: number[];
  puzzles: number[];
};

export type CaveSolveResult = CaveProgress & {
  ok: boolean;
  message: string;
  already: boolean;
  last: boolean;
};
