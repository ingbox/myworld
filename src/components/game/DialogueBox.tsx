"use client";

import { TILE } from "@/src/util/main/chip";
import { npcPortraitStyle, type RoomNpc } from "@/src/util/main/npc";

type Props = {
  npc: RoomNpc;
  lineIndex: number;
  onAdvance: () => void;
};

export default function DialogueBox({ npc, lineIndex, onAdvance }: Props) {
  const line = npc.lines[lineIndex];
  const text = line?.text ?? "";
  const last = lineIndex >= npc.lines.length - 1;

  return (
    <button
      type="button"
      data-dialogue
      className="pointer-events-auto absolute inset-x-3 bottom-24 z-30 flex max-w-xl gap-3 rounded-md border-2 border-[#e8d5b0] bg-[#1a1210]/95 p-3 text-left shadow-lg sm:inset-x-auto sm:bottom-8 sm:left-1/2 sm:w-[min(36rem,calc(100%-2rem))] sm:-translate-x-1/2"
      onClick={onAdvance}
      aria-label="대화 넘기기"
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm border border-[#e8d5b0] bg-[#2a2018]">
        <div
          style={{
            ...npcPortraitStyle(npc),
            width: TILE,
            height: TILE,
            transform: "scale(2)",
            transformOrigin: "top left",
          }}
          aria-hidden
        />
      </div>
      <div className="min-w-0 flex-1 font-dotum text-[#f4ead8]">
        <p className="mb-1 text-sm text-[#e8d5b0]">{npc.name}</p>
        <p className="text-base leading-relaxed">{text}</p>
        <p className="mt-2 text-right text-xs text-[#e8d5b0]/70">
          {last ? "확인으로 닫기" : "확인으로 다음"}
        </p>
      </div>
    </button>
  );
}
