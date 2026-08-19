"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import {
  getAskUsageToday,
  resetAskMessages,
  sendAskMessage,
} from "@/lib/services/cy/profile/intro/42/action";
import {
  askKeys,
  useAskMessages,
} from "@/lib/services/cy/profile/intro/42/useAskMessages";

type AskMessage = {
  id: number;
  user_email: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

const AI_IMAGE = "/images/profile/intro/42/jiseop-pixel.png";
const LOAD_MORE_THRESHOLD = 80;
const usageKey = [...askKeys.all, "usage"] as const;

function Avatar({
  src,
  alt,
  unoptimized,
}: {
  src: string;
  alt: string;
  unoptimized?: boolean;
}) {
  return (
    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-yellow-400">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="36px"
        className="object-cover object-top mt-0.75"
        unoptimized={unoptimized}
      />
    </div>
  );
}

export default function AskChat({
  myName,
  myImage,
}: {
  myName: string;
  myImage: string;
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const didInitialScrollRef = useRef(false);
  const isLoadingMoreRef = useRef(false);
  const scrollSnapshotRef = useRef<{
    top: number;
    height: number;
    firstMessageId: number | null;
  } | null>(null);

  const [text, setText] = useState("");

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAskMessages();

  const messages = (data?.messages ?? []) as AskMessage[];

  const { data: usage, refetch: refetchUsage } = useQuery({
    queryKey: usageKey,
    queryFn: getAskUsageToday,
  });

  const remaining = usage?.remaining ?? null;
  const isOutOfQuota = remaining === 0;

  const { mutate, isPending, error } = useMutation({
    mutationFn: sendAskMessage,
    onSuccess: ({ user, assistant }) => {
      queryClient.setQueryData<InfiniteData<AskMessage[]>>(
        askKeys.all,
        (old) => {
          if (!old) {
            return {
              pages: [[user, assistant]],
              pageParams: [undefined],
            };
          }

          return {
            ...old,
            pages: old.pages.map((page, i) =>
              i === 0 ? [...page, user, assistant] : page,
            ),
          };
        },
      );
      setText("");
      void refetchUsage();
    },
  });

  const { mutate: reset, isPending: isResetting } = useMutation({
    mutationFn: resetAskMessages,
    onSuccess: () => {
      queryClient.setQueryData<InfiniteData<AskMessage[]>>(askKeys.all, {
        pages: [],
        pageParams: [],
      });
      didInitialScrollRef.current = false;
    },
  });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || didInitialScrollRef.current || messages.length === 0) return;
    el.scrollTop = el.scrollHeight;
    didInitialScrollRef.current = true;
  }, [messages.length]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    const snapshot = scrollSnapshotRef.current;
    if (!el || !snapshot || messages.length === 0) return;
    if (messages[0]?.id === snapshot.firstMessageId) return;
    el.scrollTop = snapshot.top + (el.scrollHeight - snapshot.height);
    scrollSnapshotRef.current = null;
  }, [messages]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || !didInitialScrollRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || !hasNextPage || isFetchingNextPage || isLoadingMoreRef.current) {
      return;
    }
    if (el.scrollTop > LOAD_MORE_THRESHOLD) return;

    isLoadingMoreRef.current = true;
    scrollSnapshotRef.current = {
      top: el.scrollTop,
      height: el.scrollHeight,
      firstMessageId: messages[0]?.id ?? null,
    };

    void fetchNextPage().finally(() => {
      isLoadingMoreRef.current = false;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || isPending || isOutOfQuota) return;
    mutate(content);
  };

  const handleReset = () => {
    if (messages.length === 0 || isResetting) return;
    if (confirm("대화를 모두 지울까요? 오늘 질문 횟수는 그대로입니다.")) {
      reset();
    }
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">불러오는 중...</div>;
  }
  if (isError) {
    return (
      <div className="text-sm text-red-500">메시지를 불러오지 못했습니다.</div>
    );
  }

  return (
    <div className="flex flex-col h-125">
      <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
        <span>
          {remaining === null ? "" : `오늘 남은 질문 ${remaining}회`}
        </span>
        <button
          type="button"
          disabled={isResetting || messages.length === 0}
          onClick={handleReset}
          className="text-xs text-gray-400"
        >
          대화 초기화
        </button>
      </div>

      {error instanceof Error && (
        <p className="mb-1 text-sm text-red-500">{error.message}</p>
      )}

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto border border-gray-200 bg-[#f3f3f3] p-3 space-y-3"
      >
        {isFetchingNextPage && (
          <div className="text-center text-xs text-gray-400">
            이전 메시지 불러오는 중...
          </div>
        )}
        {!hasNextPage && messages.length > 0 && (
          <div className="text-center text-xs text-gray-300 py-1">
            처음 메시지입니다
          </div>
        )}

        {messages.map((m) => {
          const isMe = m.role === "user";

          if (isMe) {
            return (
              <div key={m.id} className="flex justify-end gap-2">
                <div className="flex max-w-[75%] flex-col items-end">
                  <span className="mb-1 text-xs text-gray-600">{myName}</span>
                  <div className="rounded-lg rounded-tr-none bg-[#fff8c4] px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap">
                    {m.content}
                  </div>
                </div>
                <Avatar src={myImage} alt={myName} unoptimized />
              </div>
            );
          }

          return (
            <div key={m.id} className="flex justify-start gap-2">
              <Avatar src={AI_IMAGE} alt="임지섭" />
              <div className="flex max-w-[75%] flex-col items-start">
                <span className="mb-1 text-xs text-gray-600">임지섭</span>
                <div className="rounded-lg rounded-tl-none bg-white px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-2 flex gap-1">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 h-8 border border-gray-300 px-2 text-sm"
          disabled={isPending || isOutOfQuota}
          required
        />
        <button
          type="submit"
          disabled={isPending || isOutOfQuota}
          className="h-8 px-3 text-sm border border-gray-400 bg-white"
        >
          보내기
        </button>
      </form>
    </div>
  );
}