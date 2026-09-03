export type VisitorListParams = {
  page: number;
  userEmail?: string;
  userRole?: string;
};

export type VisitorCommentData = {
  id: number;
  user_email: string;
  user_name: string;
  parent_id: number;
  content: string | null;
  created_at_formatted: string;
};

export type VisitorData = {
  id: number;
  user_email: string;
  user_name: string;
  profile_image_url: string | null;
  content: string | null;
  is_secret: boolean;
  created_at_formatted: string;
  comments?: VisitorCommentData[];
};

export type VisitorPaginationResult = {
  visitors: VisitorData[];
  totalCount: number;
};

export type ReportVisitorRequest = {
  visitorId: number;
};

export type DeleteVisitorRequest = {
  visitorId: string;
};

export type VisitorActionResult = {
  success: boolean;
  message?: string;
};
