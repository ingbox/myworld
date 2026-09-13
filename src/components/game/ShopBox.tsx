"use client";

import { useEffect, useState } from "react";
import { lookupItem } from "@/src/util/main/item";
import { itemSellPrice, SHOP_WARES } from "@/src/util/main/shop";
import type { InventoryItem } from "@/src/components/game/InventoryBox";

type Props = {
  items: InventoryItem[];
  money: number;
  pending?: boolean;
  onBuy: (no: number) => void;
  onSell: (no: number, qty: number) => void;
  onClose: () => void;
};

function formatMoney(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function Slot({
  name,
  sprite,
  count,
  price,
  disabled,
  onClick,
}: {
  name: string;
  sprite: string;
  count?: number;
  price: number;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="relative flex aspect-square w-full flex-col items-center rounded-sm border border-[#e8d5b0]/50 bg-[#2a2018] px-0.5 pt-0.5 pb-0.5 disabled:opacity-40"
      onClick={onClick}
    >
      <span className="w-full truncate text-center font-dotum text-[9px] leading-tight text-[#f4ead8]">
        {name}
      </span>
      <span
        className="mt-0.5 min-h-0 w-[70%] flex-1 bg-center bg-no-repeat"
        style={{
          backgroundImage: sprite ? `url(${sprite})` : undefined,
          backgroundSize: "contain",
          imageRendering: "pixelated",
        }}
        aria-hidden
      />
      {count != null ? (
        <span className="absolute bottom-0.5 left-1 font-dotum text-[10px] text-[#e8d5b0]">
          {count}
        </span>
      ) : null}
      <span className="absolute right-0.5 bottom-0.5 font-dotum text-[10px] text-[#e8d5b0]">
        {formatMoney(price)}
      </span>
    </button>
  );
}

/** 왼쪽은 상점, 오른쪽은 가방인 거래창입니다. */
export default function ShopBox({ items, money, pending, onBuy, onSell, onClose }: Props) {
  const sellable = items.filter((item) => itemSellPrice(item.no) > 0);
  const [ask, setAsk] = useState<{ item: InventoryItem; draft: string; error?: string } | null>(
    null,
  );

  useEffect(() => {
    if (!ask) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Escape") return;
      e.preventDefault();
      e.stopImmediatePropagation();
      setAsk(null);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [ask]);

  const askSell = (item: InventoryItem) => {
    if (pending) return;
    if (item.count <= 1) {
      onSell(item.no, 1);
      return;
    }
    setAsk({ item, draft: String(item.count) });
  };

  const confirmAsk = () => {
    if (!ask || pending) return;
    const qty = Number(ask.draft.trim());
    if (!Number.isInteger(qty) || qty < 1) {
      setAsk({ ...ask, error: "1 이상의 숫자를 입력하세요." });
      return;
    }
    if (qty > ask.item.count) {
      setAsk({ ...ask, error: `가진 수는 ${ask.item.count}개다.` });
      return;
    }
    const item = ask.item;
    setAsk(null);
    onSell(item.no, qty);
  };

  const askQty = ask ? Number(ask.draft.trim()) : NaN;
  const askTotal =
    ask && Number.isInteger(askQty) && askQty >= 1
      ? itemSellPrice(ask.item.no) * askQty
      : null;

  return (
    <div
      data-shop
      className="absolute inset-0 z-40 flex items-center justify-center bg-[#1a1210]/80 p-3"
      onClick={() => (ask ? setAsk(null) : onClose())}
    >
      <div
        className="flex w-[min(44rem,calc(100vw-1.5rem))] max-h-[min(32rem,calc(100vh-6rem))] flex-col overflow-hidden rounded-md border-2 border-[#e8d5b0] bg-[#1a1210] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b-2 border-[#e8d5b0] px-3 py-2">
          <p className="font-dotum text-base text-[#e8d5b0]">상점</p>
          <p className="font-dotum text-sm text-[#f4ead8]">소지 {formatMoney(money)}</p>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-2 divide-x-2 divide-[#e8d5b0]">
          <section className="flex min-h-0 flex-col">
            <p className="shrink-0 px-3 py-2 font-dotum text-sm text-[#e8d5b0]">파는 물건</p>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                {SHOP_WARES.map((ware) => {
                  const item = lookupItem(ware.no);
                  return (
                    <li key={ware.no}>
                      <Slot
                        name={item.name}
                        sprite={item.sprite}
                        price={ware.price}
                        disabled={pending || money < ware.price}
                        onClick={() => onBuy(ware.no)}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
          <section className="flex min-h-0 flex-col">
            <p className="shrink-0 px-3 py-2 font-dotum text-sm text-[#e8d5b0]">내 가방</p>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {sellable.length === 0 ? (
                <p className="px-1 py-6 text-center font-dotum text-sm text-[#f4ead8]">
                  팔 물건이 없다.
                </p>
              ) : (
                <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                  {sellable.map((item) => (
                    <li key={item.no}>
                      <Slot
                        name={item.name}
                        sprite={item.sprite}
                        count={item.count}
                        price={itemSellPrice(item.no)}
                        disabled={pending}
                        onClick={() => askSell(item)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
        <p className="shrink-0 px-3 py-2 text-right font-dotum text-[10px] text-[#e8d5b0]/70">
          클릭으로 사고팔기 / Esc로 닫기
        </p>
      </div>
      {ask ? (
        <form
          className="pointer-events-auto absolute inset-x-3 bottom-8 z-50 max-w-md rounded-md border-2 border-[#e8d5b0] bg-[#1a1210] p-3 shadow-2xl sm:left-1/2 sm:w-[min(24rem,calc(100%-2rem))] sm:-translate-x-1/2"
          onClick={(e) => e.stopPropagation()}
          onSubmit={(e) => {
            e.preventDefault();
            confirmAsk();
          }}
        >
          <p className="mb-1 font-dotum text-sm text-[#e8d5b0]">{ask.item.name}</p>
          <p className="font-dotum text-sm text-[#f4ead8]">
            몇 개 팔까? 가진 수 {ask.item.count}개 · 개당 {formatMoney(itemSellPrice(ask.item.no))}
            {askTotal != null ? ` · 합계 ${formatMoney(askTotal)}` : ""}
          </p>
          <input
            autoFocus
            inputMode="numeric"
            value={ask.draft}
            onChange={(e) => setAsk({ ...ask, draft: e.target.value, error: undefined })}
            className="mt-3 w-full rounded-sm border-2 border-[#e8d5b0]/50 bg-[#2a2018] px-3 py-2 font-dotum text-sm text-[#f4ead8] outline-none focus:border-[#e8d5b0]"
            aria-label="팔 개수"
          />
          {ask.error ? <p className="mt-2 font-dotum text-sm text-[#e08a6a]">{ask.error}</p> : null}
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-sm border-2 border-[#e8d5b0] bg-[#c45c2a] px-3 py-2 font-dotum text-sm text-white disabled:opacity-60"
            >
              팔기
            </button>
            <button
              type="button"
              className="rounded-sm border-2 border-[#e8d5b0]/40 bg-transparent px-3 py-2 font-dotum text-sm text-[#f4ead8]"
              onClick={() => setAsk(null)}
            >
              닫기
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
