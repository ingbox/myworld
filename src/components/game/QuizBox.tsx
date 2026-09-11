"use client";

type Props = {
  prompt: string;
  value: string;
  error?: string;
  pending?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

/** 동굴 표지판 문제를 입력받는 창입니다. */
export default function QuizBox({
  prompt,
  value,
  error,
  pending,
  onChange,
  onSubmit,
  onClose,
}: Props) {
  return (
    <form
      data-quiz
      className="pointer-events-auto absolute inset-x-3 bottom-24 z-50 max-w-xl rounded-md border-2 border-[#e8d5b0] bg-[#1a1210]/95 p-3 shadow-lg sm:inset-x-auto sm:bottom-8 sm:left-1/2 sm:w-[min(36rem,calc(100%-2rem))] sm:-translate-x-1/2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!pending) onSubmit();
      }}
    >
      <p className="mb-1 font-dotum text-sm text-[#e8d5b0]">표지판</p>
      <p className="font-dotum text-base leading-relaxed text-[#f4ead8]">{prompt}</p>
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="답을 입력하세요"
        className="mt-3 w-full rounded-sm border-2 border-[#e8d5b0]/50 bg-[#2a2018] px-3 py-2 font-dotum text-sm text-[#f4ead8] outline-none placeholder:text-[#e8d5b0]/40 focus:border-[#e8d5b0]"
        aria-label="관문 답"
      />
      {error ? <p className="mt-2 font-dotum text-sm text-[#e08a6a]">{error}</p> : null}
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-sm border-2 border-[#e8d5b0] bg-[#c45c2a] px-3 py-2 font-dotum text-sm text-white disabled:opacity-60"
        >
          확인
        </button>
        <button
          type="button"
          className="rounded-sm border-2 border-[#e8d5b0]/40 bg-transparent px-3 py-2 font-dotum text-sm text-[#f4ead8]"
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </form>
  );
}
