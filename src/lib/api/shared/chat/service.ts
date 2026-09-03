import type { ChatMessage } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
export const MESSAGE_PAGE_SIZE = 20;

/**
 * 채팅방 메시지 한 페이지를 채팅 API에서 가져옵니다.
 *
 * @param roomId - 채팅방 id
 * @param before - 이 메시지보다 이전을 가져올 커서. 없으면 최신부터입니다.
 * @param limit - 가져올 개수. 기본값은 {@link MESSAGE_PAGE_SIZE}
 * @returns 채팅 메시지 목록
 * @throws API 응답이 실패한 경우
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
    params.set("before", before);
  }

  const res = await fetch(`${API_URL}/messages/${roomId}?${params.toString()}`);

  if (!res.ok) {
    throw new Error("메시지를 불러오지 못했습니다.");
  }

  return res.json();
}

/**
 * 채팅방 메시지 전체를 한 번에 가져옵니다.
 * 관리자 채팅 초기 렌더에 사용합니다.
 *
 * @param roomId - 채팅방 id
 * @returns 메시지 목록
 * @throws API 응답이 실패한 경우
 */
export async function getMessages(roomId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_URL}/messages/${roomId}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("메시지를 불러오지 못했습니다.");
  }

  return res.json();
}
