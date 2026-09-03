export type PhotoData = {
  id: number;
  title: string;
  content: string;
  created_at_formatted: string;
};

export type PhotoPaginationResult = {
  photos: PhotoData[];
  totalCount: number;
};

export type PhotoTypeData = {
  id: number;
  name: string;
};
