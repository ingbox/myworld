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

  return (
    <ChatRoom
      roomId={room}
      myEmail={user?.email ?? ""}
      myName={user?.name ?? ""}
    />
  );

}