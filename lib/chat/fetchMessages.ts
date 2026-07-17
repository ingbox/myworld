import type { ChatMessage } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
export const MESSAGE_PAGE_SIZE = 20;

/**
 * 메시지 한 "페이지"를 가져옵니다.
 *
 * @param roomId   채팅방 ID
 * @param before   이 시각보다 **이전** 메시지를 가져올 때 사용 (무한 스크롤 커서)
 * @param limit    한 번에 가져올 개수
 *
 * `before`가 없으면 → 최신 메시지 limit개
 * `before`가 있으면 → 그 시각 이전(더 오래된) 메시지 limit개
 */
export async function fetchMessagesPage(
  roomId: string,
  before?: string,
  limit = MESSAGE_PAGE_SIZE,
): Promise<ChatMessage[]> {
  const params = new URLSearchParams({
    limit: String(limit),
  });

  if (before) {
    params.set('before', before);
  }

  const res = await fetch(`${API_URL}/messages/${roomId}?${params.toString()}`);

  if (!res.ok) {
    throw new Error('메시지를 불러오지 못했습니다.');
  }

  return res.json();
}
