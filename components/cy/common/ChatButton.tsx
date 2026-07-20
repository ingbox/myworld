"use client"

import { createRoom } from "@/lib/services/chat/action";
import { useSession } from "next-auth/react"

export default function ChatButton() {

  const { data: session, status } = useSession()

  const handleClick = async () => {
    if (!session?.user?.email) {
      alert("로그인 후에 이용 가능합니다.")
      return
    }
    const response = await createRoom(session?.user?.email ?? "");

    if (response) {
      window.open(`/chat/${response.id}`, "_blank", "width=420,height=700");
    }
  }

  return (
    <>
      {session?.user ? (
        <button
          onClick={() => handleClick()}
          className="flex-1 text-gray-700 text-xs bg-[#fed452] border border-[#b3a75f] rounded-xs"
        >
          채팅하기
        </button>
      ) : (
        <></>
      )}
    </>
  );
}