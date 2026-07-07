// app/actions/admin/home.ts
'use server';
import { getBaseUrl } from '@/app/actions/url';

interface ChatMessage {
  id: string;
  room_id: string;
  sender: string;
  message: string;
  created_at: string;
}

// ====== 채팅창 만들기 ======
export async function createRoom(user_email: string) {

  const url = getBaseUrl();

  console.log("url:", `${url}/api/chat/room`);

  const response = await fetch(`${url}/api/chat/room`, {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

    },

    body: JSON.stringify({ user_email }),

  });

  console.log("status:", response.status);

  const text = await response.text();

  console.log("body:", text);

  if (!response.ok) {

    throw new Error(text);

  }

  return JSON.parse(text);

}

// ====== 채팅 메시지 조회 ======
export async function getMessages(room_id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${room_id}`, {
    method: "GET",
  });

  const messages: ChatMessage[] = await res.json();

  return messages;
}