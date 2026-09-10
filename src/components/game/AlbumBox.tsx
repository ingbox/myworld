"use client";

import { useEffect, useRef } from "react";
import { ALBUM_COLS, ALBUM_SIZE } from "@/src/util/main/album";
import { lookupItem } from "@/src/util/main/item";

type Props = {
  registered: number[];
  cursor: number;
  onCursor: (no: number) => void;
  onConfirm: () => void;
  onClose: () => void;
};

/**
 * 1~99번 도감을 격자로 보여 줍니다. 화살표로 칸을 고르고 확인으로 해제합니다.
 */
export default function AlbumBox({ registered, cursor, onCursor, onConfirm, onClose }: Props) {
  const filled = new Set(registered);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-[#1a1210]/80 p-4"
      onClick={onClose}
      data-album
    >
      <div
        className="flex aspect-square w-[min(24rem,calc(100vw-2rem),calc(100vh-8rem))] flex-col overflow-hidden rounded-md border-2 border-[#e8d5b0] bg-[#1a1210] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="shrink-0 border-b-2 border-[#e8d5b0] px-3 py-2 font-dotum text-base text-[#e8d5b0]">
          도감
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <ul
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${ALBUM_COLS}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: ALBUM_SIZE }, (_, i) => {
              const no = i + 1;
              const on = filled.has(no);
              const selected = cursor === no;
              const item = lookupItem(no);
              return (
                <li key={no}>
                  <button
                    ref={selected ? selectedRef : undefined}
                    type="button"
                    data-album-no={no}
                    className={`relative flex aspect-square w-full flex-col items-center justify-center rounded-sm border bg-[#2a2018] ${
                      selected ? "border-[#c45c2a]" : "border-[#e8d5b0]/40"
                    }`}
                    onClick={() => {
                      if (selected) onConfirm();
                      else onCursor(no);
                    }}
                  >
                    <span className="font-dotum text-[9px] leading-none text-[#e8d5b0]/80">
                      {String(no).padStart(2, "0")}
                    </span>
                    {on && item.sprite ? (
                      <span
                        className="mt-0.5 h-[55%] w-[70%] bg-center bg-no-repeat"
                        style={{
                          backgroundImage: `url(${item.sprite})`,
                          backgroundSize: "contain",
                          imageRendering: "pixelated",
                        }}
                        aria-hidden
                      />
                    ) : (
                      <span
                        className={`mt-1 h-2 w-2 rounded-full ${on ? "bg-[#c45c2a]" : "bg-[#e8d5b0]/20"}`}
                        aria-hidden
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="shrink-0 px-3 pb-2 text-right font-dotum text-[10px] text-[#e8d5b0]/70">
          화살표로 이동 / 확인으로 해제 / Esc로 닫기
        </p>
      </div>
    </div>
  );
}
