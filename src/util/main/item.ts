import { FISH_BY_NO } from "@/src/util/main/fish";
import { isAlbumNo } from "@/src/util/main/album";
import catalog from "@/src/util/main/items.json";

export type ItemDef = {
  id: string;
  no: number;
  name: string;
  blurb: string;
  use: boolean;
  album: boolean;
  maxCount: number | null;
  maxPerPlayer: number | null;
  sprite: string;
  /** 처음 방문하면 가방에 한 개 넣습니다. */
  starter: boolean;
  /** 한 플레이에서 한 번만 사용할 수 있습니다. 사용 여부는 DB를 봅니다. */
  useOnce: boolean;
};

type ItemJson = {
  id: string;
  no: number;
  name: string;
  blurb: string;
  use?: boolean;
  album?: boolean;
  maxCount?: number | null;
  maxPerPlayer?: number | null;
  sprite?: string;
  starter?: boolean;
  useOnce?: boolean;
};

function fromJson(item: ItemJson): ItemDef {
  return {
    id: item.id,
    no: item.no,
    name: item.name,
    blurb: item.blurb,
    use: item.use === true,
    album: item.album === true,
    maxCount: item.maxCount ?? null,
    maxPerPlayer: item.maxPerPlayer ?? null,
    sprite: item.sprite ?? "",
    starter: item.starter === true,
    useOnce: item.useOnce === true,
  };
}

/** 도감·소비 아이템 목록. 물고기는 여기에 두지 않습니다. */
export const ITEM_LIST = (catalog.items as ItemJson[]).map(fromJson);

export const ITEM_BY_NO = new Map(ITEM_LIST.map((item) => [item.no, item]));

function fromFish(no: number): ItemDef | null {
  const fish = FISH_BY_NO.get(no);
  if (!fish) return null;
  return {
    id: fish.id,
    no: fish.no,
    name: fish.name,
    blurb: fish.blurb,
    use: fish.use === true,
    album: fish.album === true,
    maxCount: null,
    maxPerPlayer: null,
    sprite: fish.sprite,
    starter: false,
    useOnce: fish.useOnce === true,
  };
}

/**
 * 번호로 아이템을 찾습니다. 목록에 없으면 물고기, 그것도 없으면 빈 값입니다.
 *
 * @param no - 가방 번호
 */
export function lookupItem(no: number): ItemDef {
  return (
    ITEM_BY_NO.get(no) ??
    fromFish(no) ?? {
      id: `no-${no}`,
      no,
      name: `No.${no}`,
      blurb: "",
      use: false,
      album: false,
      maxCount: null,
      maxPerPlayer: null,
      sprite: "",
      starter: false,
      useOnce: false,
    }
  );
}

/**
 * 목록에 있는 아이템은 한도가 없어도 획득·사용을 DB에 남깁니다.
 *
 * @param no - 아이템 번호
 */
export function itemTrackedInDb(no: number) {
  return ITEM_BY_NO.has(no) || lookupItem(no).use;
}

/**
 * 전역·개인 한도가 있으면 서버가 지급을 검사합니다. 일반 아이템은 한도가 없습니다.
 *
 * @param no - 아이템 번호
 */
export function itemHasStockLimit(no: number) {
  const item = lookupItem(no);
  return item.maxCount !== null || item.maxPerPlayer !== null;
}

/**
 * 도감 칸(1~99)이면서 아이템이 도감 등록을 허용할 때만 올립니다.
 *
 * @param no - 아이템 번호
 */
export function canRegisterItem(no: number) {
  return lookupItem(no).album && isAlbumNo(no);
}
