"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import {
  fetchAskMessagesPage,
  getAskUsageToday,
  resetAskMessages,
  sendAskMessage,
} from "@/src/lib/api/cy/profile/intro/42/actions";
import type { AskMessage } from "@/src/lib/api/cy/profile/intro/42/types";

export const askKeys = {
  all: ["ask-messages"] as const,
  usage: () => [...askKeys.all, "usage"] as const,
};

const ASK_PAGE_SIZE = 20;

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

export function useAskUsage() {
  return useQuery({
    queryKey: askKeys.usage(),
    queryFn: getAskUsageToday,
  });
}

export function useSendAskMessage() {
  const queryClient = useQueryClient();

  return useMutation({
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
      void queryClient.invalidateQueries({ queryKey: askKeys.usage() });
    },
  });
}

export function useResetAskMessages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetAskMessages,
    onSuccess: () => {
      queryClient.setQueryData<InfiniteData<AskMessage[]>>(askKeys.all, {
        pages: [],
        pageParams: [],
      });
    },
  });
}
