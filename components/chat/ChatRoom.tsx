"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

export interface ChatMessage {
  id: string;
  room_id: string;
  sender: string;
  message: string;
  created_at: string;
}

interface Props {
  roomId: string;
  myEmail: string;
  initialMessages: ChatMessage[];
}

export default function ChatRoom({
  roomId,
  myEmail,
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
          message,
        }),
      });

      if (!res.ok) {
        throw new Error("메시지 전송 실패");
      }

      return res.json();
    },
  });

  return (
    <main className="flex flex-col h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 p-4">
        <div className="font-bold text-green-400">{roomId}</div>

        <div className="text-xs">
          {isConnected ? "🟢 연결됨" : "🔴 연결 안됨"}
        </div>
      </header>

      <MessageList
        messages={messages}
        myEmail={myEmail}
      />

      <ChatInput
        disabled={!isConnected || isPending}
        onSend={mutate}
      />
    </main>
  );
}