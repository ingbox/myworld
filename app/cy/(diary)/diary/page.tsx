import DiaryCalendarView from '@/components/cy/diary/DiaryCalendarView';
import { Providers } from '@/components/cy/common/Providers';

export default function Page() {
  return (
    <div className="h-full overflow-auto px-7 py-5 max-md:px-2 max-md:py-2">
      <Providers>
        <DiaryCalendarView />
      </Providers>
    </div>
  );
}
