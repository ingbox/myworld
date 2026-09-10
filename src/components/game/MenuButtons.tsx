"use client";

type Props = {
  onAlbum: () => void;
  onBag: () => void;
  albumOpen?: boolean;
  bagOpen?: boolean;
};

const ICON_BOX = "flex h-[36px] w-[36px] shrink-0 items-center justify-center p-0";

/**
 * 확인 위에 도감(책)·아이템(사과) 아이콘을 가로로 둡니다.
 */
export default function MenuButtons({ onAlbum, onBag, albumOpen, bagOpen }: Props) {
  return (
    <div className="pointer-events-auto absolute right-6 bottom-22 z-50 flex h-[36px] flex-row items-center gap-2">
      <button
        type="button"
        className={`${ICON_BOX} touch-none select-none ${
          albumOpen ? "opacity-100 drop-shadow-[0_0_6px_#c45c2a]" : "opacity-90 active:opacity-70"
        }`}
        aria-label="도감"
        data-action="album"
        onPointerDown={(e) => {
          e.preventDefault();
          onAlbum();
        }}
      >
        <img
          src="/images/game/icon-album.png"
          alt=""
          draggable={false}
          className="h-[36px] w-[36px] translate-y-[4px] object-contain object-center"
          style={{ imageRendering: "pixelated" }}
        />
      </button>
      <button
        type="button"
        className={`${ICON_BOX} touch-none select-none ${
          bagOpen ? "opacity-100 drop-shadow-[0_0_6px_#c45c2a]" : "opacity-90 active:opacity-70"
        }`}
        aria-label="아이템"
        data-action="item"
        onPointerDown={(e) => {
          e.preventDefault();
          onBag();
        }}
      >
        <img
          src="/images/game/icon-bag.png"
          alt=""
          draggable={false}
          className="h-[36px] w-[36px] object-contain object-center"
          style={{ imageRendering: "pixelated" }}
        />
      </button>
    </div>
  );
}
