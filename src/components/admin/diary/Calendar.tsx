'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  buildMonthCells,
  formatDayLabel,
  formatLargeDate,
  formatMonthLabel,
  getDayTextColor,
  type CalendarCell,
} from '@/src/util/shared/diary/calendar/monthCells';
import { DiaryEvent } from '@/src/util/shared/diary/calendar/types';
import DayTimeline from '@/components/cy/diary/DayTimeline';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Diary from './Diary';

type CalendarProps = {
  diaryEvents: DiaryEvent[];
  initialDate?: Date;
  onDateSelect?: (date: Date) => void;
};

function DayButton({
  cell,
  selected,
  onSelect,
}: {
  cell: CalendarCell;
  selected: boolean;
  onSelect: (date: Date) => void;
}) {
  if (cell.type === 'empty' || !cell.date) {
    return <span className="inline-flex h-7 w-7 shrink-0" aria-hidden />;
  }

  const colorClass = getDayTextColor(cell.color);

  return (
    <button
      type="button"
      onClick={() => onSelect(cell.date!)}
      className={[
        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs transition-colors',
        colorClass,
        selected
          ? 'bg-[#5a9fb8] text-white!'
          : cell.isToday
            ? 'ring-1 ring-[#5a9fb8] ring-inset'
            : 'hover:bg-zinc-100',
      ].join(' ')}
      aria-label={`${cell.day}일 선택`}
      aria-current={cell.isToday ? 'date' : undefined}
    >
      {cell.day}
    </button>
  );
}

function MonthNav({
  label,
  onPrev,
  onNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded border border-zinc-300 bg-white px-2 py-1 text-sm font-semibold text-zinc-700">
      <button
        type="button"
        onClick={onPrev}
        className="px-1 text-zinc-500 hover:text-zinc-800"
        aria-label="이전 달"
      >
        ←
      </button>
      <span className="min-w-18 text-center tracking-wide">{label}</span>
      <button
        type="button"
        onClick={onNext}
        className="px-1 text-zinc-500 hover:text-zinc-800"
        aria-label="다음 달"
      >
        →
      </button>
    </div>
  );
}

export default function Calendar({
  diaryEvents,
  initialDate,
  onDateSelect,
}: CalendarProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [today, setToday] = useState<Date | undefined>(initialDate);
  const [viewYear, setViewYear] = useState(() => initialDate?.getFullYear() ?? 0);
  const [viewMonth, setViewMonth] = useState(() =>
    initialDate ? initialDate.getMonth() + 1 : 1,
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);

  useEffect(() => {
    if (today) return;
    const now = new Date();
    setToday(now);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth() + 1);
    setSelectedDate(now);
  }, [today]);

  const cells = useMemo(
    () => (today ? buildMonthCells(viewYear, viewMonth, today) : []),
    [viewYear, viewMonth, today],
  );

  const monthLabel = formatMonthLabel(viewYear, viewMonth);

  const moveMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth - 1 + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth() + 1);
  };

  const handleSelect = (date: Date) => {
    setSelectedDate(date);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth() + 1);
    onDateSelect?.(date);
  };

  const isSelected = (cell: CalendarCell) =>
    cell.date != null &&
    selectedDate != null &&
    cell.date.toDateString() === selectedDate.toDateString();

  if (!today || !selectedDate) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
        달력 불러오는 중...
      </div>
    );
  }


  return (
    <>
      <div className="w-full rounded-[10px] border border-zinc-300 bg-white p-4 shadow-sm mb-">
        <div className="flex flex-col md:flex-row">
          {/* 왼쪽: 선택 날짜 — 모바일은 상단 가운데, 웹은 왼쪽 세로 */}
          <div className="flex flex-col items-center justify-center border-b border-dashed border-zinc-300 pb-4 md:w-22 md:shrink-0 md:border-b-0 md:border-r md:pr-4 md:pb-0 max-sm:hidden">
            <div className="font-ginto text-3xl font-bold tracking-tight text-[#5a7f92]">
              {formatLargeDate(selectedDate)}
            </div>
            <div className="mt-1 text-sm text-zinc-400">
              {formatDayLabel(selectedDate)}
            </div>
          </div>

          {/* 오른쪽: 월 네비 + 날짜 */}
          <div className="min-w-0 flex-1 pt-4 md:pl-4 md:pt-0">
            <div className="mb-3 flex justify-center md:justify-start">
              <MonthNav
                label={monthLabel}
                onPrev={() => moveMonth(-1)}
                onNext={() => moveMonth(1)}
              />
            </div>

            {/* 모바일 7열 / 웹 13열 — 같은 cells, hidden 없이 grid만 반응형 */}
            <div className="grid grid-cols-7 gap-x-1 gap-y-2 md:grid-cols-13 md:gap-y-1">
              {cells.map((cell, index) => (
                <DayButton
                  key={`${index}-${cell.day ?? 'empty'}`}
                  cell={cell}
                  selected={isSelected(cell)}
                  onSelect={handleSelect}
                />
              ))}
            </div>

            <DayTimeline events={diaryEvents} date={selectedDate} />



          </div>
        </div>
      </div >

      <QueryClientProvider client={queryClient}>
        <Diary diaryDate={selectedDate.toLocaleDateString('sv-SE')} />
      </QueryClientProvider>

      <div className="h-10">

      </div>
    </>
  );
}
