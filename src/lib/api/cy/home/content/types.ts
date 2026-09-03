export type ContentCountItem = {
  total: number;
  today: number;
};

export type ContentCountData = {
  photo: ContentCountItem;
  visitor: ContentCountItem;
  jukebox: ContentCountItem;
  board: ContentCountItem;
};

export type UpdatedNewsType = "visitor" | "photo" | "board";

export type UpdatedNewsData = {
  id: number;
  content: string;
  created_at: Date | string;
  type: UpdatedNewsType;
};
