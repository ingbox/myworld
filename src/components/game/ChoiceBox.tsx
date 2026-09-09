"use client";

type Props = {
  text: string;
  pick: "yes" | "no";
  onPick: (value: "yes" | "no") => void;
  onConfirm: () => void;
};

export default function ChoiceBox({ text, pick, onPick, onConfirm }: Props) {
  return (
    <div
      data-choice
      className="pointer-events-auto absolute inset-x-3 bottom-24 z-30 max-w-xl rounded-md border-2 border-[#e8d5b0] bg-[#1a1210]/95 p-3 shadow-lg sm:inset-x-auto sm:bottom-8 sm:left-1/2 sm:w-[min(36rem,calc(100%-2rem))] sm:-translate-x-1/2"
    >
      <p className="font-dotum text-base leading-relaxed text-[#f4ead8]">{text}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className={`flex-1 rounded-sm border-2 px-3 py-2 font-dotum text-sm ${
            pick === "yes"
              ? "border-[#e8d5b0] bg-[#c45c2a] text-white"
              : "border-[#e8d5b0]/40 bg-transparent text-[#f4ead8]"
          }`}
          onClick={() => {
            if (pick === "yes") onConfirm();
            else onPick("yes");
          }}
        >
          예
        </button>
        <button
          type="button"
          className={`flex-1 rounded-sm border-2 px-3 py-2 font-dotum text-sm ${
            pick === "no"
              ? "border-[#e8d5b0] bg-[#c45c2a] text-white"
              : "border-[#e8d5b0]/40 bg-transparent text-[#f4ead8]"
          }`}
          onClick={() => {
            if (pick === "no") onConfirm();
            else onPick("no");
          }}
        >
          아니오
        </button>
      </div>
      <p className="mt-2 text-right font-dotum text-xs text-[#e8d5b0]/70">
        좌우로 고르고 확인
      </p>
    </div>
  );
}
