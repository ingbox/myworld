/**
 * 반복 일정(weekly, daily 등) 처리
 *
 * DB에는 일정 1개만 저장 (예: 7/23 목 18:00, repeat: weekly)
 * 화면에서 날짜를 바꿀 때마다 "그날 이 일정이 있는지" 계산함
 */
import type { DiaryEvent } from './types';
import { isSameCalendarDay } from './timeline';

const HOUR_MS = 60 * 60 * 1000; // 1시간 (밀리초)
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000; // 1주 (밀리초)

/** "2026-07-23T18:00:00" 같은 문자열 → Date 객체로 바꿈 */
function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/** 시간은 버리고 날짜만 남김. 7/23 18:00 → 7/23 00:00 */
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 선택한 날짜에 원본 시각을 붙임
 * 예) date=7/30, source=7/23 18:00 → 7/30 18:00
 * (매주 목요일 18시 같은 반복 일정에 씀)
 */
function applyTimeOnDate(date: Date, source: Date): Date {
  const result = new Date(date);
  result.setHours(
    source.getHours(),
    source.getMinutes(),
    source.getSeconds(),
    0,
  );
  return result;
}

/** 시작일부터 몇 주 지났는지 (2주마다 반복 판별용) */
function weeksBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_WEEK);
}

/**
 * "이 날에 이 일정이 뜨나?" yes/no
 *
 * @param event - DB에서 온 일정 (start, repeat 포함)
 * @param date  - 캘린더에서 선택한 날
 */
export function occursOn(event: DiaryEvent, date: Date): boolean {
  const originStart = toDate(event.start); // 일정 최초 시작 (예: 7/23 18:00)
  const origin = startOfDay(originStart); // 최초 시작 날 00:00
  const day = startOfDay(date); // 선택한 날 00:00

  // 일정 시작 전 날짜면 무조건 없음 (7/23 시작인데 7/16 보면 X)
  if (day < origin) return false;

  switch (event.repeat) {
    case 'none':
      // 반복 없음 → 시작일 하루만
      return isSameCalendarDay(originStart, date);
    case 'daily':
      // 매일
      return true;
    case 'weekly':
      // 매주 같은 요일 (0=일, 4=목 ...)
      return date.getDay() === originStart.getDay();
    case 'biweekly':
      // 2주마다 같은 요일 (0주, 2주, 4주 ... 만)
      return (
        date.getDay() === originStart.getDay() &&
        weeksBetween(origin, day) % 2 === 0
      );
    case 'monthly':
      // 매월 같은 일 (23일 → 매달 23일)
      return date.getDate() === originStart.getDate();
    case 'yearly':
      // 매년 같은 월·일 (7/23 → 매년 7/23)
      return (
        date.getMonth() === originStart.getMonth() &&
        date.getDate() === originStart.getDate()
      );
    default:
      return false;
  }
}

/**
 * occursOn이 true일 때, 그날 실제로 그릴 start/end 시각 반환
 * false면 null (타임라인에 안 그림)
 */
export function getOccurrenceOnDate(
  event: DiaryEvent,
  date: Date,
): { start: Date; end: Date } | null {
  if (!occursOn(event, date)) return null;

  const originStart = toDate(event.start);
  const start = applyTimeOnDate(date, originStart);

  // end도 선택한 날 기준으로 맞춤 (원본 end 날짜 그대로 쓰면 다른 주에 안 보임)
  const end = event.end
    ? applyTimeOnDate(date, toDate(event.end))
    : new Date(start.getTime() + HOUR_MS); // end 없으면 1시간짜리

  return { start, end };
}
