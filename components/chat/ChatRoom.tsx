"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

export interface ChatMessage {
  id: string;
  room_id: string;
  sender: string;
  name: string;
  message: string;
  created_at: string;
}

interface Props {
  roomId: string;
  myEmail: string;
  myName: string;
  initialMessages: ChatMessage[];
}

export default function ChatRoom({
  roomId,
  myEmail,
  myName,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`${WS_URL}/ws/${roomId}`);

    wsRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      const message: ChatMessage = JSON.parse(event.data);

      setMessages((prev) => [...prev, message]);
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    return () => socket.close();
  }, [roomId]);

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
      // if (!res.ok) {
      //   throw new Error("메시지 전송 실패");
      // }

      return res.json();
    },
  });

  return (
    <div className="flex h-[calc(100vh-56px)] text-white">
      {/* <header className="border-b border-zinc-800 p-4">
        <div className="font-bold text-green-400">{roomId}</div>

        <div className="text-xs">
          {isConnected ? "🟢 연결됨" : "🔴 연결 안됨"}
        </div>
      </header> */}
      <div className="flex-1">
        <MessageList
          messages={messages}
          myEmail={myEmail}
        />

        <div className="fixed bottom-0 left-0 right-0">
        <ChatInput
          disabled={!isConnected || isPending}
          onSend={mutate}
        />
        </div>
      </div>
      <div className="w-40 pt-1">
        <div className="w-30 h-32 border-2 border-gray-300 relative mx-auto">
          <Image src="/images/chat/profile2.webp" alt="" className="object-cover" fill />
        </div>
      </div>
    </div>
  );
}