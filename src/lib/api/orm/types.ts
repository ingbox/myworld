export type CatData = { id: string; url: string };
export type CatPaginationResult = { cats: CatData[]; totalCount: number };

export type CatDrawingData = {
  id: number;
  catId: string;
  /** 따라 그린 원본 고양이 사진 URL */
  catUrl: string;
  imageUrl: string;
  score: number | null;
  createdAt: Date;
};

export type CatDrawingListResult = {
  drawings: CatDrawingData[];
  totalCount: number;
};

export type CreateDrawingRequest = {
  catId: string;
  file: File;
};

export type CreateDrawingResult = {
  drawing: CatDrawingData;
};
