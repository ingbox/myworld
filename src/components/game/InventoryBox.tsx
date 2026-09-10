"use client";

export type InventoryItem = {
  no: number;
  name: string;
  sprite: string;
  blurb: string;
  count: number;
  use: boolean;
  album: boolean;
};

type Props = {
  items: InventoryItem[];
  onClose: () => void;
  onSelect: (item: InventoryItem) => void;
};

/**
 * 가방을 정사각 그리드로 보여 줍니다. 칸을 누르면 사용·도감 등록을 고릅니다.
 */
export default function InventoryBox({ items, onClose, onSelect }: Props) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-[#1a1210]/80 p-4"
      onClick={onClose}
    >
      <div
        className="flex aspect-square w-[min(22rem,calc(100vw-2rem),calc(100vh-8rem))] flex-col overflow-hidden rounded-md border-2 border-[#e8d5b0] bg-[#1a1210] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="shrink-0 border-b-2 border-[#e8d5b0] px-3 py-2 font-dotum text-base text-[#e8d5b0]">
          아이템
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="px-1 py-6 text-center font-dotum text-sm text-[#f4ead8]">
              아직 아이템이 없다.
            </p>
          ) : (
            <ul className="grid grid-cols-5 gap-1.5">
              {items.map((item) => (
                <li key={item.no}>
                  <button
                    type="button"
                    className="relative flex aspect-square w-full flex-col items-center rounded-sm border border-[#e8d5b0]/50 bg-[#2a2018] px-0.5 pt-0.5 pb-0.5"
                    onClick={() => onSelect(item)}
                  >
                    <span className="w-full truncate text-center font-dotum text-[9px] leading-tight text-[#f4ead8]">
                      {item.name}
                    </span>
                    <span
                      className="mt-0.5 min-h-0 flex-1 w-[70%] bg-center bg-no-repeat"
                      style={{
                        backgroundImage: item.sprite ? `url(${item.sprite})` : undefined,
                        backgroundSize: "contain",
                        imageRendering: "pixelated",
                      }}
                      aria-hidden
                    />
                    <span className="absolute bottom-0.5 left-1 font-dotum text-[10px] text-[#e8d5b0]">
                      {item.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="shrink-0 px-3 pb-2 text-right font-dotum text-[10px] text-[#e8d5b0]/70">
          클릭으로 고르기 / Esc로 닫기
        </p>
      </div>
    </div>
  );
}
