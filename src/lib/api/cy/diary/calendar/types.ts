export type DiaryRepeat =
  | "none"
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "yearly";

export type DiaryEventData = {
  id: string;
  title: string;
  all_day: boolean;
  start: Date;
  end: Date | null;
  repeat: DiaryRepeat;
  color: string;
  memo: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type DiaryData = {
  id: number;
  content: string;
  diary_date: Date | string;
  created_at: Date | string;
  deleted_at: Date | string | null;
};

export type DiaryEventsResponse = {
  events: DiaryEventData[];
};
