// app/actions/admin/home.ts
'use server';
interface ChatMessage {
  id: string;
  room_id: string;
  sender: string;
  message: string;
  created_at: string;
}

// ====== 채팅 메시지 조회 ======
export async function getMessages(room_id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${room_id}`, {
    method: "GET",
  });

  const messages: ChatMessage[] = await res.json();
  return messages;
}
