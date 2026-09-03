import Calendar from '@/components/admin/diary/Calendar';
import { getDiaryEvents } from "@/src/lib/api/cy/diary/calendar/service";

export default async function Page() {
  const diaryEvents = await getDiaryEvents();

  return (
    <div className="h-full px-7 py-5 overflow-auto max-md:px-2 max-md:py-2">
      <Calendar diaryEvents={diaryEvents.events} />
    </div>
  );
}
