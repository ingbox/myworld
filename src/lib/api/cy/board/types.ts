export type BoardData = {
  id: number;
  title: string;
  created_at_formatted: string;
  view_count: number | null;
};

export type BoardPaginationResult = {
  boards: BoardData[];
  totalCount: number;
};

export type BoardContentData = {
  id: number;
  title: string;
  content: string;
  type_id: number;
  created_at: Date | string;
  created_at_formatted: string;
};
