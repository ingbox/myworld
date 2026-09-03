export type BoardCommentData = {
  id: number;
  board_id: number;
  parent_id: number | null;
  user_name: string;
  user_email: string;
  content: string;
  created_at_formatted: string;
};
