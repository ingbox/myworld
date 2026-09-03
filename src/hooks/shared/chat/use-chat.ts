"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import {
  fetchMessagesPage,
  MESSAGE_PAGE_SIZE,
} from "@/src/lib/api/shared/chat/service";
import type { ChatMessage } from "@/src/lib/api/shared/chat/types";

export const messageKeys = {
  all: ["messages"] as const,
  room: (roomId: string) => [...messageKeys.all, roomId] as const,
};

export function flattenMessagePages(pages: ChatMessage[][]): ChatMessage[] {
  return pages.slice().reverse().flat();
}

export function appendMessageToCache(
  queryClient: QueryClient,
  roomId: string,
  message: ChatMessage,
) {
  queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
    messageKeys.room(roomId),
    (old) => {
      if (!old) return old;

      const alreadyExists = old.pages.some((page) =>
        page.some((item) => item.id === message.id),
      );
      if (alreadyExists) return old;

      return {
        ...old,
        pages: old.pages.map((page, index) =>
          index === 0 ? [...page, message] : page,
        ),
      };
    },
  );
}

export function useChatMessages(roomId: string) {
  return useInfiniteQuery({
    queryKey: messageKeys.room(roomId),
    queryFn: ({ pageParam }) => fetchMessagesPage(roomId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < MESSAGE_PAGE_SIZE) {
        return undefined;
      }

      return lastPage[0]?.created_at;
    },
    select: (data) => ({
      ...data,
      messages: flattenMessagePages(data.pages),
    }),
  });
}
