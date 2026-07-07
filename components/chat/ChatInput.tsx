"use client";

import { useRef, useState } from "react";

interface Props {
  disabled: boolean;
  onSend: (message: string) => void;
}

export default function ChatInput({
  disabled,
  onSend,
}: Props) {
  const [input, setInput] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;

    onSend(input.trim());

    setInput("");

    inputRef.current?.focus();
  };

  return (
    <div className="border-t border-zinc-800 p-4 flex gap-2">
      <input
        ref={inputRef}
        value={input}
        disabled={disabled}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
        className="flex-1 bg-black border border-zinc-700 rounded px-4 py-2"
        placeholder="메시지를 입력하세요"
      />

      <button
        disabled={disabled || !input.trim()}
        onClick={handleSend}
        className="bg-green-600 px-5 rounded disabled:opacity-40"
      >
        전송
      </button>
    </div>
  );
}