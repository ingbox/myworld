'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchMessagesPage, MESSAGE_PAGE_SIZE } from './fetchMessages';
import { flattenMessagePages, messageKeys } from './messageKeys';

export function useChatMessages(roomId: string) {
  return useInfiniteQuery({
    queryKey: messageKeys.room(roomId),
    queryFn: ({ pageParam }) => fetchMessagesPage(roomId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < MESSAGE_PAGE_SIZE) {
        return undefined;
      }

      // API가 ASC로 내려주므로 [0]이 이 페이지에서 가장 오래된 메시지 = 다음 커서
      return lastPage[0]?.created_at;
    },
    select: (data) => ({
      ...data,
      messages: flattenMessagePages(data.pages),
    }),
  });
}
