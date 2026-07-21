import type { DiaryEvent } from '@/lib/calendar/types';

type DiaryEventsResponse = {
  events: DiaryEvent[];
};

export async function fetchDiaryEvents(): Promise<DiaryEventsResponse> {
  const res = await fetch('/api/cy/diary/events');

  if (!res.ok) {
    throw new Error('일정을 불러오지 못했습니다.');
  }

  return res.json();
}
