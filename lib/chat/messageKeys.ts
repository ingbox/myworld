import type { ChatMessage } from './types';

/** TanStack Query 캐시 key — 방마다 다른 캐시를 쓰기 위한 이름표 */
export const messageKeys = {
  all: ['messages'] as const,
  room: (roomId: string) => [...messageKeys.all, roomId] as const,
};

/**
 * useInfiniteQuery의 pages를 화면용 시간순 배열 하나로 합칩니다.
 *
 * pages[0] = 최신 묶음, pages[1] = 더 오래된 묶음 ...
 * → reverse 후 flat 하면 [오래된 ... 최신] 순서
 */
export function flattenMessagePages(pages: ChatMessage[][]): ChatMessage[] {
  return pages.slice().reverse().flat();
}
