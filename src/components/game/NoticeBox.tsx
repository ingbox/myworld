"use client";

type Props = {
  text: string;
  title?: string;
  onClose: () => void;
};

/** 아이템·도감 결과 한 줄을 대화창 스타일로 보여 줍니다. */
export default function NoticeBox({ text, title, onClose }: Props) {
  return (
    <button
      type="button"
      data-notice
      className="pointer-events-auto absolute inset-x-3 bottom-24 z-50 max-w-xl rounded-md border-2 border-[#e8d5b0] bg-[#1a1210]/95 p-3 text-left shadow-lg sm:inset-x-auto sm:bottom-8 sm:left-1/2 sm:w-[min(36rem,calc(100%-2rem))] sm:-translate-x-1/2"
      onClick={onClose}
    >
      {title ? (
        <p className="mb-1 font-dotum text-sm text-[#e8d5b0]">{title}</p>
      ) : null}
      <p className="font-dotum text-base leading-relaxed text-[#f4ead8]">{text}</p>
      <p className="mt-2 text-right font-dotum text-xs text-[#e8d5b0]/70">확인으로 닫기</p>
    </button>
  );
}
