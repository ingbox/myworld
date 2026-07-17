"use client";

import { useLayoutEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/chat/types";

interface Props {
  messages: ChatMessage[];
  myEmail: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => Promise<unknown>;
}

const LOAD_MORE_THRESHOLD = 80;

export default function MessageList({
  messages,
  myEmail,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const didInitialScrollRef = useRef(false);
  const isLoadingMoreRef = useRef(false);

  /** 과거 메시지 로드 직전 스크롤 상태 */
  const scrollSnapshotRef = useRef<{
    top: number;
    height: number;
    firstMessageId: string;
  } | null>(null);

  // 첫 입장 → 최신 메시지(맨 아래)
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || didInitialScrollRef.current || messages.length === 0) return;

    el.scrollTop = el.scrollHeight;
    didInitialScrollRef.current = true;
  }, [messages.length]);

  // 과거 메시지가 위에 prepend 됐을 때만 스크롤 위치 복원
  useLayoutEffect(() => {
    const el = containerRef.current;
    const snapshot = scrollSnapshotRef.current;
    if (!el || !snapshot || messages.length === 0) return;

    const firstMessageId = messages[0]?.id;
    if (firstMessageId === snapshot.firstMessageId) return;

    el.scrollTop =
      snapshot.top + (el.scrollHeight - snapshot.height);
    scrollSnapshotRef.current = null;
  }, [messages]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (
      !el ||
      !hasNextPage ||
      isFetchingNextPage ||
      isLoadingMoreRef.current
    ) {
      return;
    }

    if (el.scrollTop > LOAD_MORE_THRESHOLD) return;

    isLoadingMoreRef.current = true;
    scrollSnapshotRef.current = {
      top: el.scrollTop,
      height: el.scrollHeight,
      firstMessageId: messages[0]?.id ?? "",
    };

    void onLoadMore().finally(() => {
      isLoadingMoreRef.current = false;
    });
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto p-4 space-y-2 bg-white"
    >
      {isFetchingNextPage && (
        <div className="pointer-events-none absolute top-2 left-0 right-0 z-10 text-center text-xs text-zinc-400">
          이전 메시지 불러오는 중...
        </div>
      )}

      {!hasNextPage && messages.length > 0 && (
        <div className="text-center text-xs text-zinc-300 py-2">
          처음 메시지입니다
        </div>
      )}

      {messages.map((msg) => {
        const isMe = msg.sender === myEmail;

        return (
          <div key={msg.id}>
            <div>
              <div className="text-sm text-zinc-500">
                {msg.name}님의 말:
              </div>

              <div
                className={`text-sm max-w-sm ${
                  isMe
                    ? "text-gray-700"
                    : "text-[#649b61]"
                }`}
              >
                {msg.message}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
