"use client";

type Props = {
  onConfirm: () => void;
  hint?: boolean;
};

export default function ActionButton({ onConfirm, hint }: Props) {
  return (
    <button
      type="button"
      className={`pointer-events-auto absolute right-6 bottom-6 z-50 flex h-14 w-14 touch-none items-center justify-center rounded-full text-sm font-dotum text-white select-none ${
        hint ? "bg-[#c45c2a] active:bg-[#a84c22]" : "bg-black/50 active:bg-black/70"
      }`}
      aria-label="확인"
      data-action="confirm"
      onPointerDown={(e) => {
        e.preventDefault();
        onConfirm();
      }}
    >
      확인
    </button>
  );
}
