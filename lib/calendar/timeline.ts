import type { DiaryEvent } from './types';

export const TIMELINE_HOUR_COUNT = 24;
export const MINUTES_PER_DAY = TIMELINE_HOUR_COUNT * 60;
const HOUR_MS = 60 * 60 * 1000;

export type TimelineHourSlot = {
  hour: number;
  label: string;
};

/** 하루(00:00~24:00) 축 위의 progress bar */
export type TimelineEventBar = {
  eventId: string;
  title: string;
  color: string;
  allDay: boolean;
  /** hover/tooltip용 — "13:00 ~ 14:30" 또는 "종일" */
  timeRangeLabel: string;
  /** 하루 시작(00:00) 기준 시작 위치 0~100% */
  offsetPercent: number;
  /** 하루 전체 대비 길이 0~100% */
  sizePercent: number;
};

export type DayTimelineModel = {
  hourTicks: TimelineHourSlot[];
  bars: TimelineEventBar[];
};

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function formatTimelineTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatEventTimeRange(
  allDay: boolean,
  startMs: number,
  endMs: number,
): string {
  if (allDay) {
    return '종일 (00:00 ~ 24:00)';
  }

  return `${formatTimelineTime(new Date(startMs))} ~ ${formatTimelineTime(new Date(endMs))}`;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

export function buildTimelineHours(): TimelineHourSlot[] {
  return Array.from({ length: TIMELINE_HOUR_COUNT - 1 }, (_, index) => {
    const hour = index + 1;
    return {
      hour,
      label: formatHourLabel(hour),
    };
  });
}

/** 1시간 간격 tick (01:00 ~ 23:00) — buildTimelineHours() 와 동일 */
export function buildTimelineTickHours(): TimelineHourSlot[] {
  return buildTimelineHours();
}

function getDayBounds(date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return { dayStart, dayEnd };
}

function resolveEventStart(event: DiaryEvent): Date {
  return toDate(event.start);
}

function resolveEventEnd(event: DiaryEvent): Date {
  if (event.end) {
    return toDate(event.end);
  }

  const start = resolveEventStart(event);
  return new Date(start.getTime() + HOUR_MS);
}

function toDayPercents(startMs: number, endMs: number, dayStartMs: number) {
  const startMin = (startMs - dayStartMs) / 60000;
  const endMin = (endMs - dayStartMs) / 60000;

  return {
    offsetPercent: (startMin / MINUTES_PER_DAY) * 100,
    sizePercent: ((endMin - startMin) / MINUTES_PER_DAY) * 100,
  };
}

/** selectedDate 하루를 가로(또는 세로) progress bar 축으로 변환 */
export function buildDayTimeline(
  events: DiaryEvent[],
  date: Date,
): DayTimelineModel {
  const { dayStart, dayEnd } = getDayBounds(date);
  const dayStartMs = dayStart.getTime();
  const bars: TimelineEventBar[] = [];

  for (const event of events) {
    const start = resolveEventStart(event);

    if (!isSameCalendarDay(start, date)) {
      continue;
    }

    if (event.all_day) {
      bars.push({
        eventId: event.id,
        title: event.title,
        color: event.color,
        allDay: true,
        timeRangeLabel: formatEventTimeRange(true, dayStartMs, dayEnd.getTime()),
        offsetPercent: 0,
        sizePercent: 100,
      });
      continue;
    }

    const end = resolveEventEnd(event);
    const overlapStart = Math.max(start.getTime(), dayStartMs);
    const overlapEnd = Math.min(end.getTime(), dayEnd.getTime());

    if (overlapStart >= overlapEnd) {
      continue;
    }

    const { offsetPercent, sizePercent } = toDayPercents(
      overlapStart,
      overlapEnd,
      dayStartMs,
    );

    bars.push({
      eventId: event.id,
      title: event.title,
      color: event.color,
      allDay: false,
      timeRangeLabel: formatEventTimeRange(false, overlapStart, overlapEnd),
      offsetPercent,
      sizePercent: Math.max(sizePercent, 0.5),
    });
  }

  return {
    hourTicks: buildTimelineHours(),
    bars,
  };
}

/**
 * 분(minute)만으로 해당 hour 구간의 fill 비율 (0~100)
 * 1시 40분 → 40/60 ≈ 66.7%
 */
export function minuteToHourFillPercent(minute: number): number {
  const clamped = Math.min(Math.max(minute, 0), 59);
  return (clamped / 60) * 100;
}
