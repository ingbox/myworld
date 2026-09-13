import { lookupItem } from "@/src/util/main/item";
import catalog from "@/src/util/main/shop.json";

export type ShopWare = {
  no: number;
  price: number;
};

export const SHOP_NPC_ID = catalog.npc;

export const SHOP_WARES = catalog.wares as ShopWare[];

/**
 * 상점이 이 번호를 파는지, 얼마인지 봅니다. 안 팔면 null입니다.
 *
 * @param no - 아이템 번호
 */
export function shopBuyPrice(no: number) {
  const ware = SHOP_WARES.find((row) => row.no === no);
  return ware ? ware.price : null;
}

/**
 * 이 물건을 상점에 팔 때 받는 돈입니다. 0이면 팔 수 없습니다.
 *
 * @param no - 아이템 번호
 */
export function itemSellPrice(no: number) {
  return lookupItem(no).sellPrice;
}
