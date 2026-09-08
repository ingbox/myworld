import Calendar from '@/components/admin/diary/Calendar';
import { getDiaryEvents } from "@/src/lib/api/cy/diary/calendar/service";
import Link from 'next/link';

export default async function Page() {
  const diaryEvents = await getDiaryEvents();

  return (
    <div className="h-full px-7 py-5 overflow-auto max-md:px-2 max-md:py-2">
      <Link href="/admin/diary/setting" className="flex mb-2 w-full">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-bold">
          일정 추가
        </button>
      </Link>
      <Calendar diaryEvents={diaryEvents.events} />
    </div>
  );
}
