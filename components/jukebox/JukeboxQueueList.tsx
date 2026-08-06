"use client";

import {
  selectQueue,
  selectRemoveFromQueue,
  usePlayerStore,
} from "@/stores/usePlayerStore";

export default function JukeboxQueueList() {
  const queue = usePlayerStore(selectQueue);
  const removeFromQueue = usePlayerStore(selectRemoveFromQueue);

  if (queue.length === 0) {
    return (
      <div className="text-xs text-gray-400">재생 목록이 비어있음</div>
    );
  }

  return (
    <>
      {queue.map((item) => (
        <div key={item.queueId} className="flex items-center justify-between">
          <div className="text-xs text-gray-500 truncate">
            {item.title ?? "track"}
          </div>

          <svg
            width="13"
            height="13"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className="inline align-middle ml-1 cursor-pointer shrink-0"
            style={{ verticalAlign: "middle" }}
            onClick={() => removeFromQueue(item.queueId)}
            aria-label={`${item.title ?? "track"} 삭제`}
            role="img"
          >
            <rect
              width="100"
              height="100"
              fill="transparent"
              stroke="#6B7280"
              strokeWidth="5"
            />
            <line
              x1="20"
              y1="20"
              x2="80"
              y2="80"
              stroke="#6B7280"
              strokeWidth="5"
            />
            <line
              x1="80"
              y1="20"
              x2="20"
              y2="80"
              stroke="#6B7280"
              strokeWidth="5"
            />
          </svg>
        </div>
      ))}
    </>
  );
}
