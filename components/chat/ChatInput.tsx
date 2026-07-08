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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;

    onSend(input.trim());

    setInput("");

    textareaRef.current?.focus();
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={input}
        disabled={disabled}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        className="
        w-full
        h-20
        max-h-20
        min-h-20
        resize-none
        p-3
        pr-28
        shadow-[inset_0_2px_6px_rgba(0,0,0,0.05)]
        focus:outline-none"
      />
      <button
        disabled={disabled || !input.trim()}
        onClick={handleSend}
        className="
        absolute
        right-3
        top-1/2
        -translate-y-1/2
        p-1
        text-gray-400
        text-sm
        font-extrabold
        border
        shadow-inner"
      >
        보내기
      </button>
    </div>
  );
}