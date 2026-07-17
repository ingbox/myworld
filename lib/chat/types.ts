/** 채팅 서버(chats 테이블)와 동일한 메시지 형태 */
export interface ChatMessage {
  id: string;
  room_id: string;
  sender: string;
  name: string;
  message: string;
  created_at: string;
}
