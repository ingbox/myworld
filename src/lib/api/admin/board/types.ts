export type CreateBoardRequest = {
  title: string;
  content: string;
  type: number;
};

export type CreateBoardResult = {
  success: true;
  boardId: number | undefined;
};
