export type ProfileCommentReplyData = {
  id: number;
  user_email: string;
  user_name: string;
  parent_id: number;
  content: string;
  created_at_formatted: string;
};

export type ProfileCommentData = {
  id: number;
  user_email: string;
  user_name: string;
  content: string;
  created_at_formatted: string;
  comments: ProfileCommentReplyData[];
};

export type ProfileCommentListResult = {
  comments: ProfileCommentData[];
};
