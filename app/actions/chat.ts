// app/actions/admin/home.ts
'use server';
import { getBaseUrl } from '@/app/actions/url';

// ====== 채팅창 만들기 ======
export async function createRoom(user_email: string) {
    const url = getBaseUrl();

    const response = await fetch(`${url}/api/chat/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_email }),
      });
      
      const text = await response.text();
  
      if (!response.ok) {
        throw new Error(text);
      }

      return JSON.parse(text);
  }