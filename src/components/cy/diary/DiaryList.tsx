import { useDiary } from "@/src/hooks/cy/diary/use-diary";

export default function DiaryList({ diaryDate }: { diaryDate: string }) {
    const { data, isLoading, isError } = useDiary(diaryDate);

    const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

    function formatWeekday(value: Date | string) {
        const d = value instanceof Date ? value : new Date(value);
        return WEEKDAYS[d.getDay()];
    }

    function formatDiaryDate(value: Date | string) {
        const d = value instanceof Date ? value : new Date(value);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}.${m}.${day}`;
    }

    function formatDiaryDateTime(value: Date | string) {
        const d = value instanceof Date ? value : new Date(value);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const h = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${y}.${m}.${day} ${h}:${min}`;
    }

    if (isLoading) {
        return (
            <div className="diary-paper mt-4">
                <div className="diary-paper-inner px-4 py-6 text-center text-xs text-zinc-400">
                    일기 불러오는 중...
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="diary-paper mt-4">
                <div className="diary-paper-inner px-4 py-6 text-center text-xs text-red-400">
                    일기를 불러오지 못했습니다.
                </div>
            </div>
        );
    }

    if (!data?.length) {
        return (
            <div className="diary-paper mt-4">
                <div className="diary-paper-inner px-4 py-6 text-center text-xs text-zinc-400">
                    이 날짜에 작성된 일기가 없습니다.
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-3">
            {data.map((diary) => (
                <div key={diary.id} className="diary-paper">
                    <div className="diary-paper-inner px-4 py-3">
                        <div className="flex items-center gap-1 mb-2">
                            <span className="text-sm text-[#459ebe] font-bold tracking-wide">{formatDiaryDate(diary.diary_date)}</span>
                            <span className="text-sm text-[#459ebe] font-bold tracking-wide">{formatWeekday(diary.diary_date)}</span>
                            <span className="text-xs text-zinc-400 max-sm:hidden">({formatDiaryDateTime(diary.created_at)})</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                            {diary.content}
                        </p>
                    </div>
                </div>
           
            ))}
        </div>
    );
}