"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import Image from "next/image";
import { appendMessageToCache } from "@/lib/chat/appendMessageToCache";
import type { ChatMessage } from "@/lib/chat/types";
import { useChatMessages } from "@/lib/chat/useChatMessages";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

interface Props {
  roomId: string;
  myEmail: string;
  myName: string;
}

export default function ChatRoom({
  roomId,
  myEmail,
  myName,
}: Props) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(roomId);

  const messages = data?.messages ?? [];
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(`${WS_URL}/ws/${roomId}`);

    wsRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      const message: ChatMessage = JSON.parse(event.data);
      appendMessageToCache(queryClient, roomId, message);
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    return () => socket.close();
  }, [roomId, queryClient]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch(`${API_URL}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          sender: myEmail,
          name: myName,
          message,
        }),
      });

      return res.json();
    },
  });

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <div className="flex flex-1 min-h-0">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-zinc-400 bg-white">
            메시지 불러오는 중...
          </div>
        ) : isError ? (
          <div className="flex-1 flex items-center justify-center text-sm text-red-400 bg-white">
            메시지를 불러오지 못했습니다.
          </div>
        ) : (
          <MessageList
            messages={messages}
            myEmail={myEmail}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
          />
        )}

        <div className="w-40 shrink-0 pt-1 z-0 max-md:hidden">
          <div className="w-30 h-32 border-2 border-gray-300 relative mx-auto">
            <Image src="/images/chat/profile2.webp" alt="" className="object-cover" fill />
          </div>
        </div>
      </div>

      <div className="h-20 shrink-0 relative z-50 bg-white border-t border-gray-200">
        <ChatInput
          disabled={!isConnected || isPending || isLoading}
          onSend={mutate}
        />
      </div>
    </div>
  );
}
