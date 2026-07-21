"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import createDiaryEvent from "@/lib/services/admin/diary/calendar/action";
import { diaryKeys } from "@/lib/services/cy/diary/diaryKeys";

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
  const [repeat, setRepeat] = useState("none");
  const [color, setColor] = useState(colorOptions[0]);
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createDiaryEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diaryKeys.all });
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

  return (
    <div className="max-w-full mx-auto p-6 bg-white">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">제목</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">하루종일</label>
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
            className="accent-sky-500"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              {allDay ? "시작 날짜" : "시작"}
            </label>
            <input
              type={allDay ? "date" : "datetime-local"}
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              {allDay ? "종료 날짜" : "종료"}
            </label>
            <input
              type={allDay ? "date" : "datetime-local"}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">반복</label>
          <select
            className="w-full border rounded px-2 py-2"
            value={repeat}
            onChange={e => setRepeat(e.target.value)}
          >
            {repeatOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">색깔</label>
          <div className="flex gap-2 mt-1">
            {colorOptions.map(opt => (
              <button
                key={opt}
                type="button"
                className={`w-7 h-7 rounded-full border-2 ${color === opt ? "border-black" : "border-gray-200"}`}
                style={{ background: opt }}
                onClick={() => setColor(opt)}
                aria-label={opt}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">메모</label>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[80px] resize-y"
            value={memo}
            onChange={e => setMemo(e.target.value)}
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm my-1">{error}</div>
        )}
        <button
          type="submit"
          className="bg-sky-500 text-white py-2 rounded font-semibold hover:bg-sky-600 transition"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "추가 중..." : "일정 추가"}
        </button>
      </form>
    </div>
  );
}