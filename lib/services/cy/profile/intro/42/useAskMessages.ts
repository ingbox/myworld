"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchAskMessagesPage } from "@/lib/services/cy/profile/intro/42/action";


export const askKeys = {
  all: ["ask-messages"] as const,
};

const ASK_PAGE_SIZE = 20

export function useAskMessages() {
  return useInfiniteQuery({
    queryKey: askKeys.all,
    queryFn: ({ pageParam }) => fetchAskMessagesPage(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < ASK_PAGE_SIZE) return undefined;
      return lastPage[0]?.created_at;
    },
    select: (data) => ({
      ...data,
      messages: data.pages.slice().reverse().flat(),
    }),
  });
}