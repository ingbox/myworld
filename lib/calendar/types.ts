export type DiaryRepeat =
  | "none"
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "yearly";

export interface DiaryEvent {
  id: string;              // pg BIGSERIAL → 로그에도 '3' 문자열
  title: string;
  all_day: boolean;
  start: Date;             // 서버(node-pg)에서 쓸 때
  end: Date | null;        // 스키마상 NULL 가능하면
  repeat: DiaryRepeat;
  color: string;
  memo: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null; // soft delete → null 가능
}