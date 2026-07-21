'use client';

import Calendar from '@/components/cy/diary/Calendar';
import { useDiaryEvents } from '@/lib/services/cy/diary/useDiaryEvents';

export default function DiaryCalendarView() {
  const { data, isLoading, isError } = useDiaryEvents();

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
        일정 불러오는 중...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-red-400">
        일정을 불러오지 못했습니다.
      </div>
    );
  }

  return <Calendar diaryEvents={data.events} />;
}
