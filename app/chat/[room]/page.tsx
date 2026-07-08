import { getMessages } from '@/app/actions/chat';
import { auth } from '@/app/auth';

import ChatRoom from "@/components/chat/ChatRoom";

export default async function Page({
  params,
}: {
  params: Promise<{ room: string }>;
}) {
  const { room } = await params;

  const session = await auth();
  const user = session?.user;

  const rawMessages = await getMessages(room);
  const messages = JSON.parse(JSON.stringify(rawMessages));

  return (
    <ChatRoom
      roomId={room}
      myEmail={user?.email ?? ""}
      myName={user?.name ?? ""}
      initialMessages={messages}
    />
  );

}