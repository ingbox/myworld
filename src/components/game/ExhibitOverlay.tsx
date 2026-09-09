"use client";

import type { RoomExhibit } from "@/src/util/main/exhibit";

type Props = {
  exhibit: RoomExhibit;
  page: number;
  onAdvance: () => void;
};

/**
 * 표지판 확인 뒤 프로젝트 개요를 페이지 단위로 보여 줍니다.
 * 확인을 누르면 다음 페이지로 넘어갑니다.
 */
export default function ExhibitOverlay({ exhibit, page, onAdvance }: Props) {
  const total = Math.min(3, exhibit.summary.length);
  const last = page >= total - 1;
  const text = exhibit.summary[page] ?? "";
  const accent = exhibit.accent ?? "#e8d5b0";

  return (
    <div
      data-exhibit={exhibit.id}
      className="absolute inset-0 z-40 flex items-center justify-center bg-[#1a1210]/80 p-4"
      onClick={onAdvance}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-md border-2 border-[#e8d5b0] bg-[#1a1210] shadow-2xl"
        style={{ boxShadow: `0 0 0 2px ${accent}55` }}
      >
        <div
          className="relative h-40 w-full overflow-hidden border-b-2 border-[#e8d5b0] sm:h-48"
          style={{ background: accent }}
        >
          {exhibit.cover ? (
            <div
              className="absolute inset-0 origin-center scale-105"
              style={{
                backgroundImage: `url(${exhibit.cover})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                animation: "exhibit-cover 0.55s ease-out",
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#2a2018]">
              <span className="font-dotum text-lg text-[#f4ead8]">{exhibit.title}</span>
            </div>
          )}
        </div>
        <div className="p-4 font-dotum text-[#f4ead8]">
          <p className="mb-3 text-lg text-[#e8d5b0]">{exhibit.title}</p>
          <div className="min-h-24 text-base leading-relaxed">
            <p key={page} style={{ animation: "exhibit-line 0.4s ease-out" }}>
              {text}
            </p>
          </div>
          <p
            className={`mt-3 h-4 text-right text-xs text-[#e8d5b0]/80 ${
              last ? "invisible" : "animate-pulse"
            }`}
          >
            다음 &gt;
          </p>
        </div>
      </div>
    </div>
  );
}
