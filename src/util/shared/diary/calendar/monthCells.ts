export type DayColor = 'default' | 'sunday' | 'saturday' | 'holiday';

/** 월별 캘린더 한 칸 */
export type CalendarCell = { 
  type: 'empty' | 'day';
  date: Date | null;
  day: number | null;
  color: DayColor;
  isToday: boolean;
};

/** 고정 공휴일 (양력). 음력 공휴일은 추후 API 연동 */
const FIXED_HOLIDAYS: Record<string, string> = {
  '01-01': '신정',
  '03-01': '삼일절',
  '05-05': '어린이날',
  '06-06': '현충일',
  '08-15': '광복절',
  '10-03': '개천절',
  '10-09': '한글날',
  '12-25': '성탄절',
};

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDayColor(date: Date): DayColor {
  const weekday = date.getDay();
  const key = `${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

  if (FIXED_HOLIDAYS[key]) return 'holiday';
  if (weekday === 0) return 'sunday';
  if (weekday === 6) return 'saturday';
  return 'default';
}

/**
 * 해당 월의 캘린더 배열 생성
 * - 월요일 시작 (앞 빈 칸 = ㅁ)
 * - 7열 그리드에 맞게 empty + day 순서대로 반환
 */
export function buildMonthCells(
  year: number,
  month: number,
  today: Date = new Date(),
): CalendarCell[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();

  // 월요일=1 ... 일요일=0
  const sundayBasedOffset = firstDay.getDay();
  const cells: CalendarCell[] = [];

  for (let i = 0; i < sundayBasedOffset; i += 1) {
    cells.push({
      type: 'empty',
      date: null,
      day: null,
      color: 'default',
      isToday: false,
    });
  }

  for (let day = 1; day <= lastDate; day += 1) {
    const date = new Date(year, month - 1, day);
    cells.push({
      type: 'day',
      date,
      day,
      color: getDayColor(date),
      isToday: isSameDay(date, today),
    });
  }

  return cells;
}

/** 웹에서 13칸씩 두 줄로 나누기 (Cyworld 스타일) */
export function splitCellsForWebRows(cells: CalendarCell[], rowSize = 13) {
  const rows: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += rowSize) {
    rows.push(cells.slice(i, i + rowSize));
  }
  return rows;
}

export function formatMonthLabel(year: number, month: number) {
  return `${year}.${pad2(month)}`;
}

export function formatLargeDate(date: Date) {
  return `${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
}

export function formatDayLabel(date: Date) {
  return date
    .toLocaleDateString('en-US', { weekday: 'short' })
    .toUpperCase();
}

export function getDayTextColor(color: DayColor) {
  switch (color) {
    case 'sunday':
    case 'holiday':
      return 'text-[#c45c26]';
    case 'saturday':
      return 'text-[#4a60ab]';
    default:
      return 'text-zinc-500';
  }
}
