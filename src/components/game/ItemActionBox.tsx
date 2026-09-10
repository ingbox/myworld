"use client";

import { objectParticle } from "@/src/util/main/fish";
import type { InventoryItem } from "@/src/components/game/InventoryBox";

type PickKind = "use" | "register";

type Props = {
  item: InventoryItem;
  pick: PickKind;
  onPick: (value: PickKind) => void;
  onConfirm: () => void;
};

/**
 * 아이템이 허용하는 행동만 보여 줍니다.
 */
export default function ItemActionBox({ item, pick, onPick, onConfirm }: Props) {
  const actions = [
    item.use ? ("use" as const) : null,
    item.album ? ("register" as const) : null,
  ].filter((value): value is PickKind => value !== null);

  return (
    <div
      className="pointer-events-auto absolute inset-x-3 bottom-24 z-50 max-w-xl rounded-md border-2 border-[#e8d5b0] bg-[#1a1210]/95 p-3 shadow-lg sm:inset-x-auto sm:bottom-8 sm:left-1/2 sm:w-[min(36rem,calc(100%-2rem))] sm:-translate-x-1/2"
      data-item-action
      onClick={(e) => e.stopPropagation()}
    >
      <p className="font-dotum text-base leading-relaxed text-[#f4ead8]">
        {item.name}{objectParticle(item.name)} 어떻게 할까?
      </p>
      <div className="mt-3 flex gap-2">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            className={`flex-1 rounded-sm border-2 px-3 py-2 font-dotum text-sm ${
              pick === action
                ? "border-[#e8d5b0] bg-[#c45c2a] text-white"
                : "border-[#e8d5b0]/40 bg-transparent text-[#f4ead8]"
            }`}
            onClick={() => {
              if (pick === action) onConfirm();
              else onPick(action);
            }}
          >
            {action === "use" ? "사용" : "도감 등록"}
          </button>
        ))}
      </div>
      <p className="mt-2 text-right font-dotum text-xs text-[#e8d5b0]/70">
        {actions.length > 1 ? "좌우로 고르고 확인" : "확인으로 실행"}
      </p>
    </div>
  );
}
