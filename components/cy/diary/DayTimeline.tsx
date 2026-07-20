'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildDayTimeline, TIMELINE_HOUR_COUNT } from '@/lib/calendar/timeline';
import type { TimelineEventBar } from '@/lib/calendar/timeline';
import type { DiaryEvent } from '@/lib/calendar/types';

type DayTimelineProps = {
  events: DiaryEvent[];
  date: Date;
};

function HourGrid({ axis }: { axis: 'horizontal' | 'vertical' }) {
  const isHorizontal = axis === 'horizontal';

  return (
    <>
      {Array.from({ length: TIMELINE_HOUR_COUNT + 1 }, (_, hour) => (
        <div
          key={hour}
          className="pointer-events-none absolute bg-zinc-200/70"
          style={
            isHorizontal
              ? {
                  left: `${(hour / TIMELINE_HOUR_COUNT) * 100}%`,
                  top: 0,
                  bottom: 0,
                  width: hour === 0 || hour === TIMELINE_HOUR_COUNT ? 0 : '1px',
                }
              : {
                  top: `${(hour / TIMELINE_HOUR_COUNT) * 100}%`,
                  left: 0,
                  right: 0,
                  height: hour === 0 || hour === TIMELINE_HOUR_COUNT ? 0 : '1px',
                }
          }
          aria-hidden
        />
      ))}
    </>
  );
}

function TimelineBar({
  bar,
  axis,
  showHoverTooltip,
  isActive,
  onActivate,
}: {
  bar: TimelineEventBar;
  axis: 'horizontal' | 'vertical';
  showHoverTooltip: boolean;
  isActive?: boolean;
  onActivate?: () => void;
}) {
  const isHorizontal = axis === 'horizontal';

  return (
    <button
      type="button"
      className={[
        'group/bar absolute z-10 rounded-full opacity-90 transition-opacity',
        showHoverTooltip ? 'cursor-default hover:opacity-100' : 'cursor-pointer',
        isActive ? 'opacity-100 ring-2 ring-zinc-400 ring-offset-1' : '',
      ].join(' ')}
      style={
        isHorizontal
          ? {
              left: `${bar.offsetPercent}%`,
              width: `${bar.sizePercent}%`,
              top: '3px',
              bottom: '3px',
            }
          : {
              top: `${bar.offsetPercent}%`,
              height: `${bar.sizePercent}%`,
              left: '3px',
              right: '3px',
            }
      }
      title={`${bar.title} · ${bar.timeRangeLabel}`}
      aria-label={`${bar.title}, ${bar.timeRangeLabel}`}
      onClick={onActivate}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ backgroundColor: bar.color }}
      />

      {showHoverTooltip && (
        <div
          className={
            isHorizontal
              ? 'pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-sm transition-opacity group-hover/bar:opacity-100 group-focus-visible/bar:opacity-100'
              : 'pointer-events-none absolute right-full top-1/2 z-30 mr-1 -translate-y-1/2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-sm transition-opacity group-hover/bar:opacity-100 group-focus-visible/bar:opacity-100'
          }
        >
          {bar.timeRangeLabel}
        </div>
      )}
    </button>
  );
}

function EventTrack({
  bar,
  axis,
  showHoverTooltip,
  isActive,
  onActivate,
}: {
  bar: TimelineEventBar;
  axis: 'horizontal' | 'vertical';
  showHoverTooltip: boolean;
  isActive?: boolean;
  onActivate?: () => void;
}) {
  const isHorizontal = axis === 'horizontal';

  return (
    <div
      className={
        isHorizontal
          ? 'relative h-8 overflow-visible rounded-md bg-zinc-50'
          : 'relative min-h-[480px] w-6 max-w-8 shrink-0 overflow-visible rounded-md bg-zinc-50'
      }
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-md">
        <HourGrid axis={axis} />
      </div>
      <TimelineBar
        bar={bar}
        axis={axis}
        showHoverTooltip={showHoverTooltip}
        isActive={isActive}
        onActivate={onActivate}
      />
      <span
        className={
          isHorizontal
            ? 'pointer-events-none absolute left-1.5 top-1/2 z-20 max-w-[36%] -translate-y-1/2 truncate text-[10px] font-medium text-gray-600 pl-2'
            : 'pointer-events-none absolute bottom-1.5 left-1/2 z-20 max-h-[70%] -translate-x-1/2 truncate text-[10px] font-medium [writing-mode:vertical-rl] text-gray-600'
        }
      >
        {bar.title}
      </span>
    </div>
  );
}

function HourTicks({
  ticks,
  axis,
}: {
  ticks: { hour: number; label: string }[];
  axis: 'horizontal' | 'vertical';
}) {
  if (axis === 'horizontal') {
    return (
      <div className="mb-1 grid grid-cols-24 gap-0">
        {ticks.map((tick) => (
          <span
            key={tick.hour}
            className="text-center text-[8px] tabular-nums leading-none text-zinc-400 sm:text-[9px]"
          >
            {tick.label.replace(':00', '')}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="relative mr-1.5 min-h-[480px] w-9 shrink-0">
      {ticks.map((tick) => {
        const isFirst = tick.hour === 0;
        const isLast = tick.hour === TIMELINE_HOUR_COUNT - 1;

        return (
          <span
            key={tick.hour}
            className={[
              'absolute right-0 text-right text-[8px] tabular-nums leading-none text-zinc-400',
              isFirst
                ? 'top-0 translate-y-0'
                : isLast
                  ? 'bottom-0 translate-y-0'
                  : '-translate-y-1/2',
            ].join(' ')}
            style={
              isFirst || isLast
                ? undefined
                : { top: `${(tick.hour / TIMELINE_HOUR_COUNT) * 100}%` }
            }
          >
            {tick.label}
          </span>
        );
      })}
    </div>
  );
}

export default function DayTimeline({ events, date }: DayTimelineProps) {
  const [activeBarId, setActiveBarId] = useState<string | null>(null);

  const timeline = useMemo(
    () => buildDayTimeline(events, date),
    [events, date],
  );

  useEffect(() => {
    setActiveBarId(null);
  }, [date]);

  if (timeline.bars.length === 0) {
    return (
      <div className="mt-4 text-center text-xs text-zinc-400 md:text-left">
        현재 일정/기념일이 없습니다.
      </div>
    );
  }

  const allDayBars = timeline.bars.filter((bar) => bar.allDay);
  const timedBars = timeline.bars.filter((bar) => !bar.allDay);
  const activeBar = timeline.bars.find((bar) => bar.eventId === activeBarId) ?? null;

  return (
    <div className="mt-4 space-y-4">
      {/* sm+ : 가로 progress bar */}
      <div className="hidden sm:block">
        <HourTicks ticks={timeline.hourTicks} axis="horizontal" />

        {allDayBars.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {allDayBars.map((bar) => (
              <EventTrack
                key={bar.eventId}
                bar={bar}
                axis="horizontal"
                showHoverTooltip
              />
            ))}
          </div>
        )}

        {timedBars.length > 0 && (
          <div className="space-y-1.5">
            {timedBars.map((bar) => (
              <EventTrack
                key={bar.eventId}
                bar={bar}
                axis="horizontal"
                showHoverTooltip
              />
            ))}
          </div>
        )}
      </div>

      {/* max-sm : 세로 progress bar */}
      <div className="sm:hidden">
        <div className="mx-auto max-w-[160px]">
          <div className="flex max-h-80 overflow-y-auto overflow-x-visible pt-1 pb-1">
            <HourTicks ticks={timeline.hourTicks} axis="vertical" />

            <div className="flex min-h-[480px] flex-1 justify-center gap-1.5 px-1">
              {allDayBars.map((bar) => (
                <EventTrack
                  key={`v-allday-${bar.eventId}`}
                  bar={bar}
                  axis="vertical"
                  showHoverTooltip={false}
                  isActive={activeBarId === bar.eventId}
                  onActivate={() =>
                    setActiveBarId((prev) =>
                      prev === bar.eventId ? null : bar.eventId,
                    )
                  }
                />
              ))}

              {timedBars.map((bar) => (
                <EventTrack
                  key={`v-${bar.eventId}`}
                  bar={bar}
                  axis="vertical"
                  showHoverTooltip={false}
                  isActive={activeBarId === bar.eventId}
                  onActivate={() =>
                    setActiveBarId((prev) =>
                      prev === bar.eventId ? null : bar.eventId,
                    )
                  }
                />
              ))}
            </div>
          </div>

          {activeBar && (
            <div className="mt-2 rounded-md bg-zinc-800 px-3 py-2 text-center text-[11px] text-white">
              <span className="font-medium">{activeBar.title}</span>
              <span className="mx-1.5 text-zinc-400">·</span>
              <span className="text-zinc-200">{activeBar.timeRangeLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
