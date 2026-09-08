"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import createDiaryEvent from "@/src/lib/api/admin/diary/calendar/action";
import { diaryEventKeys } from "@/src/hooks/cy/diary/calendar/use-diary-events";
import type { DiaryRepeat } from "@/src/lib/api/admin/diary/calendar/types";

const repeatOptions = [
  { value: "none", label: "반복 없음" },
  { value: "daily", label: "매일" },
  { value: "weekly", label: "매주" },
  { value: "biweekly", label: "2주마다" },
  { value: "monthly", label: "매월" },
  { value: "yearly", label: "매년" },
];

const colorOptions = [
  "#f87171", // red-400
  "#facc15", // yellow-400
  "#4ade80", // green-400
  "#38bdf8", // sky-400
  "#a78bfa", // purple-400
  "#f472b6", // pink-400
];

export default function DiaryEventSettingPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [repeat, setRepeat] = useState<DiaryRepeat>("none");
  const [color, setColor] = useState(colorOptions[0]);
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createDiaryEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diaryEventKeys.all });
      // 초기화
      setTitle("");
      setAllDay(false);
      setStart("");
      setEnd("");
      setRepeat("none");
      setColor(colorOptions[0]);
      setMemo("");
      setError(null);
      alert("일정이 추가되었습니다!");
    },
    onError: () => {
      setError("일정 추가에 실패했습니다. 다시 시도해주세요.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!start || !end) {
      setError(
        allDay
          ? "시작과 종료 날짜를 모두 입력해주세요."
          : "시작과 종료 날짜/시간을 모두 입력해주세요.",
      );
      return;
    }
    if (start > end) {
      setError(
        allDay
          ? "시작 날짜가 종료 날짜보다 늦을 수 없습니다."
          : "시작 시간이 종료 시간보다 늦을 수 없습니다.",
      );
      return;
    }

    setError(null);
    mutation.mutate({
      title,
      allDay,
      start,
      end,
      repeat,
      color,
      memo,
    });
  };

  const fieldClass =
  "h-9 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#459ebe]";


  return (
    <div className="h-full overflow-auto px-7 py-5 max-md:px-2 max-md:py-2">
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">제목</label>
          <input
            type="text"
            className={fieldClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            required
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => {
              const checked = e.target.checked;
              setAllDay(checked);
              if (checked) {
                setStart((prev) => (prev ? prev.slice(0, 10) : ""));
                setEnd((prev) => (prev ? prev.slice(0, 10) : ""));
              } else {
                setStart((prev) => (prev ? `${prev}T00:00` : ""));
                setEnd((prev) => (prev ? `${prev}T23:59` : ""));
              }
            }}
            className="accent-[#459ebe]"
          />
          하루종일
        </label>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {allDay ? "시작 날짜" : "시작"}
            </label>
            <input
              type={allDay ? "date" : "datetime-local"}
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div className="min-w-0 flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {allDay ? "종료 날짜" : "종료"}
            </label>
            <input
              type={allDay ? "date" : "datetime-local"}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className={fieldClass}
              required
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">반복</label>
          <select
            className="h-9 w-full rounded border border-gray-300 bg-white px-2 text-sm text-gray-600 outline-none focus:border-[#459ebe]"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value as DiaryRepeat)}
          >
            {repeatOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">색깔</label>
          <div className="mt-1 flex gap-2">
            {colorOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`h-7 w-7 rounded-full border ${color === opt
                    ? "border-[#459ebe] ring-1 ring-[#459ebe]"
                    : "border-gray-300"
                  }`}
                style={{ background: opt }}
                onClick={() => setColor(opt)}
                aria-label={opt}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">메모</label>
          <textarea
            className="min-h-20 w-full resize-y rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#459ebe]"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            className="h-9 min-w-22 rounded bg-[#459ebe] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "추가 중..." : "확인"}
          </button>
        </div>
      </form>
    </div>
  );
}