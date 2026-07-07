import { auth } from '@/app/auth';

import ChatRoom from "@/components/chat/ChatRoom";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

interface ChatMessage {
  id: string;
  room_id: string;
  sender: string;
  message: string;
  created_at: string;
}

export default async function Page({
  params,
}: {
  params: Promise<{ room: string }>;
}) {

  const { room } = await params;

  const session = await auth();

  const res = await fetch(`${API_URL}/messages/${room}`, {
    cache: "no-store",
  });

  console.log("res:", res);

  const messages: ChatMessage[] = await res.json();

  return (
    <ChatRoom
      roomId={room}
      myEmail={session?.user?.email ?? ""}
      initialMessages={messages}
    />
  );

}