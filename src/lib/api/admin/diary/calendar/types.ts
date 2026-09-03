export type DiaryRepeat =
  | "none"
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "yearly";

export type CreateDiaryEventRequest = {
  title: string;
  allDay: boolean;
  start: string;
  end: string;
  repeat: DiaryRepeat;
  color: string;
  memo: string;
};

export type CreateDiaryRequest = {
  content: string;
  diaryDate: string;
};

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
