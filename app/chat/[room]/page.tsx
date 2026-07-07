import { getMessages } from '@/app/actions/chat';
import { auth } from '@/app/auth';

import ChatRoom from "@/components/chat/ChatRoom";

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
  const user = session?.user;

  const messages = await getMessages(room);

  return (
    <ChatRoom
      roomId={room}
      myEmail={user?.email ?? ""}
      initialMessages={messages}
    />
  );

}