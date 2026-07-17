import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { ChatMessage } from './types';
import { messageKeys } from './messageKeys';

/** WebSocket으로 새 메시지가 왔을 때 Query 캐시 맨 뒤(최신)에 붙입니다 */
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
