export interface ChatMessage {
  id: string;
  room_id: string;
  sender: string;
  name: string;
  message: string;
  created_at: string;
}

export type ChatRoomRecord = {
  id: string;
  user_email: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
