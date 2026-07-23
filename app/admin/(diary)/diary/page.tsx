import Calendar from '@/components/admin/diary/Calendar';
import { getDiaryEvents } from '@/lib/services/cy/diary/service';
import { Suspense } from 'react';

export default async function Page() {

  const diaryEvents = await getDiaryEvents();
  
  return (
    <div className="h-full px-7 py-5 overflow-auto max-md:px-2 max-md:py-2">
      <Suspense fallback={null}>
        <Calendar diaryEvents={diaryEvents.events} />
      </Suspense>
    </div>
  );
}
