/**
 * 하루 타임라인(00:00~24:00 progress bar) 데이터 만들기
 * DayTimeline 컴포넌트가 이걸 받아서 UI로 그림
 */
import type { DiaryEvent } from './types';
import { getOccurrenceOnDate } from './occurence';

export const TIMELINE_HOUR_COUNT = 24;
export const MINUTES_PER_DAY = TIMELINE_HOUR_COUNT * 60; // 1440분 = 하루

export type TimelineHourSlot = {
  hour: number;
  label: string;
};

/** 타임라인 위에 그릴 막대 1개 (일정 1건) */
export type TimelineEventBar = {
  eventId: string;
  title: string;
  color: string;
  allDay: boolean;
  /** hover/tooltip — "18:00 ~ 19:00" 또는 "종일" */
  timeRangeLabel: string;
  /** 막대 시작 위치 (하루 0% ~ 100%) */
  offsetPercent: number;
  /** 막대 길이 (하루 대비 %) */
  sizePercent: number;
};

export type DayTimelineModel = {
  hourTicks: TimelineHourSlot[]; // 1, 2, 3 ... 시각 눈금
  bars: TimelineEventBar[]; // 그날 일정 막대들
};

/** 9 → "09:00" */
export function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

/** Date → "18:00" (분까지) */
export function formatTimelineTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/** 툴팁용 시간 문자열 */
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

/** 같은 날인지 (년·월·일만 비교) */
export function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

/** 타임라인 눈금 01:00 ~ 23:00 */
export function buildTimelineHours(): TimelineHourSlot[] {
  return Array.from({ length: TIMELINE_HOUR_COUNT - 1 }, (_, index) => {
    const hour = index + 1;
    return {
      hour,
      label: formatHourLabel(hour),
    };
  });
}

/** buildTimelineHours 와 동일 */
export function buildTimelineTickHours(): TimelineHourSlot[] {
  return buildTimelineHours();
}

/** 선택한 날의 00:00 ~ 다음날 00:00 */
function getDayBounds(date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return { dayStart, dayEnd };
}

/**
 * 시작~끝 시각을 하루 축 기준 % 로 변환
 * 예) 18:00 시작, 19:00 끝 → offset 75%, size 4.17% 정도
 */
function toDayPercents(startMs: number, endMs: number, dayStartMs: number) {
  const startMin = (startMs - dayStartMs) / 60000;
  const endMin = (endMs - dayStartMs) / 60000;

  return {
    offsetPercent: (startMin / MINUTES_PER_DAY) * 100,
    sizePercent: ((endMin - startMin) / MINUTES_PER_DAY) * 100,
  };
}

/**
 * events + 선택한 date → 그날 타임라인 모델
 * 반복 일정은 getOccurrenceOnDate 로 "그날" start/end 를 먼저 구함
 */
export function buildDayTimeline(
  events: DiaryEvent[],
  date: Date,
): DayTimelineModel {
  const { dayStart, dayEnd } = getDayBounds(date);
  const dayStartMs = dayStart.getTime();
  const bars: TimelineEventBar[] = [];

  for (const event of events) {
    // 반복 규칙 적용: 이 날에 없으면 skip
    const occurrence = getOccurrenceOnDate(event, date);
    if (!occurrence) continue;

    const { start, end } = occurrence;

    if (event.all_day) {
      bars.push({
        eventId: event.id,
        title: event.title,
        color: event.color,
        allDay: true,
        timeRangeLabel: formatEventTimeRange(true, dayStartMs, dayEnd.getTime()),
        offsetPercent: 0,
        sizePercent: 100, // 종일 = 막대 전체
      });
      continue;
    }

    // 자정 넘어가는 일정 등: 그날 구간만 잘라서 사용
    const overlapStart = Math.max(start.getTime(), dayStartMs);
    const overlapEnd = Math.min(end.getTime(), dayEnd.getTime());

    if (overlapStart >= overlapEnd) {
      continue; // 그날과 겹치는 시간 없음
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
      sizePercent: Math.max(sizePercent, 0.5), // 너무 짧으면 최소 0.5%는 보이게
    });
  }

  return {
    hourTicks: buildTimelineHours(),
    bars,
  };
}

/** 1시 40분 → 그 시간 칸의 66.7% 채움 (별도 UI용) */
export function minuteToHourFillPercent(minute: number): number {
  const clamped = Math.min(Math.max(minute, 0), 59);
  return (clamped / 60) * 100;
}
