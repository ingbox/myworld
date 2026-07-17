"use client";

import { useEffect, useRef, useState } from "react";

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
  const isSendingRef = useRef(false);

  useEffect(() => {
    if (!disabled) {
      isSendingRef.current = false;
    }
  }, [disabled]);

  const handleSend = () => {
    if (!input.trim() || disabled || isSendingRef.current) return;

    isSendingRef.current = true;
    const message = input.trim();
    setInput("");
    onSend(message);
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
          // 한글 IME 조합 중 Enter → 전송하지 않음 (조합 확정용 Enter)
          if (e.nativeEvent.isComposing || e.keyCode === 229) return;
          // Enter 키 꾹 누름 반복 방지
          if (e.repeat) return;

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
        text-sm
        text-gray-700
        p-3
        pr-28
        shadow-[inset_0_2px_6px_rgba(0,0,0,0.05)]
        focus:outline-none"
        style={{
          resize: "none"
        }}
      />
      <button
        type="button"
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