"use client";

import { useState } from "react";
import { Track, usePlayerStore } from "@/stores/usePlayerStore";

const mockTracks: Track[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i),
  title: `track ${i + 1}`,
  artist: "unknown", // 추가
  url: `/audios/audio${(i % 3) + 1}.mp3`, // src → url로 변경
}));

export default function Queue() {
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const start = (page - 1) * ITEMS_PER_PAGE;
  const currentTracks = mockTracks.slice(start, start + ITEMS_PER_PAGE);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };
  const handlePlay = () => {
    const selectedTracks = mockTracks.filter((t) => selected.has(t.id));
    if (selectedTracks.length === 0) return;
    addToQueue(selectedTracks);
  };
  const totalPages = Math.ceil(mockTracks.length / ITEMS_PER_PAGE);
  return (
    <div className="p-4 space-y-3">
      {/* 리스트 */}
      <div className="space-y-1">
        {currentTracks.map((track) => (
          <div key={track.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.has(track.id)}
              onChange={() => toggleSelect(track.id)}
            />
            <span>{track.title}</span>
          </div>
        ))}
      </div>
      {/* 페이지네이션 */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          이전
        </button>
        <span>{page} / {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          다음
        </button>
      </div>
      {/* 듣기 버튼 */}
      <button
        onClick={handlePlay}
        className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
      >
        선택한 곡 듣기
      </button>
    </div>
  );

}