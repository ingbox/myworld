"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import DPad from "@/src/components/game/DPad";
import Player from "@/src/components/game/Player";
import NpcSprite from "@/src/components/game/NpcSprite";
import TileSprite from "@/src/components/game/TileSprite";
import DialogueBox from "@/src/components/game/DialogueBox";
import ActionButton from "@/src/components/game/ActionButton";
import MenuButtons from "@/src/components/game/MenuButtons";
import InventoryBox from "@/src/components/game/InventoryBox";
import type { InventoryItem } from "@/src/components/game/InventoryBox";
import AlbumBox from "@/src/components/game/AlbumBox";
import ItemActionBox from "@/src/components/game/ItemActionBox";
import NoticeBox from "@/src/components/game/NoticeBox";
import ExhibitOverlay from "@/src/components/game/ExhibitOverlay";
import ChoiceBox from "@/src/components/game/ChoiceBox";
import FishingFx from "@/src/components/game/FishingFx";
import {
  addCatch,
  getAlbum,
  getBag,
  pickupItem,
  registerToAlbum,
  unregisterFromAlbum,
  useBagItem,
} from "@/src/util/main/bag-action";
import type { BagEntry } from "@/src/util/main/bag";
import { moveAlbumCursor } from "@/src/util/main/album";
import { useTileWalk } from "@/src/hooks/game/use-tile-walk";
import { useFishing } from "@/src/hooks/game/use-fishing";
import {
  ROOMS,
  SHEETS,
  buildWalkable,
  findOpening,
  findSpriteInFront,
  isAdjacentSprite,
  isWallTile,
  exhibitCoverStyle,
  spriteBottomY,
  tileBackground,
  type Room,
} from "@/src/util/main/room";
import { CAMERA_SCALE, TILE, type Dir } from "@/src/util/main/chip";
import EmotionBalloon from "@/src/components/game/EmotionBalloon";
import { findNpcInFront, isAdjacentNpc, type RoomNpc } from "@/src/util/main/npc";
import {
  findExhibitInFront,
  hasProjectUrl,
  isAdjacentExhibit,
  openProjectUrl,
  type RoomExhibit,
} from "@/src/util/main/exhibit";
import { sanitizeGameWorld, useGameWorldStore } from "@/src/stores/useGameWorldStore";
import { lookupItem } from "@/src/util/main/item";
import { canFishAt, objectParticle, type FishDef } from "@/src/util/main/fish";

const KEY_DIR: Record<string, Dir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
};

function Floor({ room }: { room: Room }) {
  const { cols, rows, floor } = room;
  const cells = cols * rows;
  const sheet = SHEETS[floor.sheet ?? "room"] ?? SHEETS.room;

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${TILE}px)`,
        gridTemplateRows: `repeat(${rows}, ${TILE}px)`,
      }}
    >
      {Array.from({ length: cells }, (_, i) => {
        const col = i % cols;
        const sheetCol = floor.srcCol + (col % floor.srcCols);
        return (
          <div
            key={i}
            style={{
              width: TILE,
              height: TILE,
              ...tileBackground(sheet, sheetCol, floor.srcRow),
            }}
          />
        );
      })}
    </div>
  );
}

function Walls({ room }: { room: Room }) {
  if (room.kind === "outdoor" || !room.wallColors) return null;
  const { cols, rows, wallColors } = room;
  const tiles = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!isWallTile(room, col, row)) continue;
      const background =
        row === 0 ? wallColors.top : row === 1 ? wallColors.mid : wallColors.edge;
      tiles.push(
        <div
          key={`${col}-${row}`}
          className="absolute"
          style={{
            left: col * TILE,
            top: row * TILE,
            width: TILE,
            height: TILE,
            background,
          }}
        />,
      );
    }
  }
  return <>{tiles}</>;
}

export default function HouseWorld() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [{ w: viewW, h: viewH }, setView] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useState(false);
  const [roomId, setRoomId] = useState("bedroom");
  const [spawn, setSpawn] = useState(ROOMS.bedroom.start);
  const [startFacing, setStartFacing] = useState<Dir>("down");
  const [talk, setTalk] = useState<{ npc: RoomNpc; line: number } | null>(null);
  const [exhibit, setExhibit] = useState<RoomExhibit | null>(null);
  const [exhibitPage, setExhibitPage] = useState(0);
  const [choice, setChoice] = useState<{
    exhibit: RoomExhibit;
    pick: "yes" | "no";
  } | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [bag, setBag] = useState<BagEntry[]>([]);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [album, setAlbum] = useState<number[]>([]);
  const [albumCursor, setAlbumCursor] = useState(1);
  const [itemAction, setItemAction] = useState<{
    item: InventoryItem;
    pick: "use" | "register";
  } | null>(null);
  const [notice, setNotice] = useState<{ title?: string; text: string } | null>(null);
  const savedCatchRef = useRef<FishDef | null>(null);
  const exhibitRef = useRef<RoomExhibit | null>(null);
  exhibitRef.current = exhibit;
  const room = ROOMS[roomId] ?? ROOMS.bedroom;
  const { fishing, start: startFish, hook: hookFish, stop: stopFish } = useFishing();
  const busy =
    talk !== null ||
    exhibit !== null ||
    choice !== null ||
    fishing !== null ||
    bagOpen ||
    albumOpen ||
    itemAction !== null ||
    notice !== null;
  const remember = useGameWorldStore((state) => state.remember);

  const walkable = useMemo(() => buildWalkable(room), [room]);
  const canWalk = useCallback(
    (col: number, row: number) => walkable[row]?.[col] === true,
    [walkable],
  );
  const onArrive = useCallback(
    (col: number, row: number) => {
      const opening = findOpening(room, col, row);
      if (!opening || !ROOMS[opening.to]) return false;
      setRoomId(opening.to);
      setSpawn({ col: opening.spawnCol, row: opening.spawnRow });
      return true;
    },
    [room],
  );
  const { col, row, px, py, facing, walkFrame, holdStart, holdEnd, isMoving } =
    useTileWalk({
      cols: room.cols,
      rows: room.rows,
      startCol: spawn.col,
      startRow: spawn.row,
      startFacing,
      roomId,
      canWalk,
      onArrive,
      paused: busy || !ready,
    });

  const mapW = room.cols * TILE;
  const mapH = room.rows * TILE;
  const cameraX = viewW / 2 - (px + TILE / 2) * CAMERA_SCALE;
  const cameraY = viewH / 2 - (py + TILE / 2) * CAMERA_SCALE;
  const facingNpc = findNpcInFront(room.npcs, col, row, facing);
  const facingExhibit = findExhibitInFront(room.exhibits, col, row, facing);
  const facingGive = findSpriteInFront(room.sprites, col, row, facing);
  const giveNo = facingGive?.give;
  const canFish = canFishAt(room, col, row, facing);
  const worldRef = useRef({ roomId, col, row, facing, ready });
  worldRef.current = { roomId, col, row, facing, ready };

  const bagItems = useMemo(
    () =>
      bag.map((entry) => {
        const item = lookupItem(entry.no);
        return { ...item, count: entry.count };
      }),
    [bag],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.all([getBag(), getAlbum()]).then(([entries, nos]) => {
      if (cancelled) return;
      setBag(entries);
      setAlbum(nos);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!fishing) {
      savedCatchRef.current = null;
      return;
    }
    const caught = fishing.catch;
    if (!fishing.success || !caught) return;
    if (savedCatchRef.current === caught) return;
    savedCatchRef.current = caught;
    void addCatch(caught.no).then(setBag);
  }, [fishing]);

  useLayoutEffect(() => {
    let cancelled = false;
    const boot = async () => {
      try {
        await useGameWorldStore.persist.rehydrate();
      } catch {
        /* localStorage 가 없어도 기본 위치에서 시작합니다. */
      }
      if (cancelled) return;
      const saved = sanitizeGameWorld(useGameWorldStore.getState());
      setRoomId(saved.roomId);
      setSpawn({ col: saved.col, row: saved.row });
      setStartFacing(saved.facing);
      setReady(true);
    };
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || isMoving) return;
    remember({ roomId, col, row, facing });
  }, [ready, isMoving, roomId, col, row, facing, remember]);

  useEffect(() => {
    const save = () => {
      const current = worldRef.current;
      if (!current.ready) return;
      remember({
        roomId: current.roomId,
        col: current.col,
        row: current.row,
        facing: current.facing,
      });
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") save();
    };
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      save();
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [remember]);

  const finishExhibit = useCallback(() => {
    const current = exhibitRef.current;
    if (!current) return;
    exhibitRef.current = null;
    setExhibit(null);
    setExhibitPage(0);
    if (hasProjectUrl(current.url)) {
      setChoice({ exhibit: current, pick: "yes" });
    }
  }, []);

  const confirmChoice = useCallback(() => {
    if (!choice) return;
    if (choice.pick === "yes") openProjectUrl(choice.exhibit.url);
    setChoice(null);
  }, [choice]);

  const toggleBag = useCallback(() => {
    if (!ready) return;
    if (notice) {
      setNotice(null);
      return;
    }
    if (itemAction) {
      setItemAction(null);
      return;
    }
    if (bagOpen) {
      setBagOpen(false);
      return;
    }
    if (talk || exhibit || choice || fishing) return;
    setAlbumOpen(false);
    setBagOpen(true);
  }, [ready, notice, itemAction, bagOpen, talk, exhibit, choice, fishing]);

  const toggleAlbum = useCallback(() => {
    if (!ready) return;
    if (notice) {
      setNotice(null);
      return;
    }
    if (albumOpen) {
      setAlbumOpen(false);
      setItemAction(null);
      return;
    }
    if (talk || exhibit || choice || fishing) return;
    setBagOpen(false);
    setItemAction(null);
    setAlbumOpen(true);
  }, [ready, notice, albumOpen, talk, exhibit, choice, fishing]);

  const confirmItemAction = useCallback(() => {
    if (!itemAction) return;
    if (itemAction.pick === "use") {
      if (!itemAction.item.use) {
        setItemAction(null);
        setNotice({ text: "사용할 수 없는 아이템이다." });
        return;
      }
      const no = itemAction.item.no;
      void useBagItem(no).then((res) => {
        setBag(res.bag);
        setAlbum(res.album);
        setItemAction(null);
        setNotice({ text: res.message });
      });
      return;
    }
    if (!itemAction.item.album) {
      setItemAction(null);
      setNotice({ text: "도감에 등록할 수 없는 아이템이다." });
      return;
    }
    const no = itemAction.item.no;
    void registerToAlbum(no).then((res) => {
      setBag(res.bag);
      setAlbum(res.album);
      setItemAction(null);
      setNotice({ text: res.message });
    });
  }, [itemAction]);

  const takeGive = useCallback((no: number) => {
    if (!ready) return;
    void pickupItem(no).then((res) => {
      setBag(res.bag);
      setNotice({ text: res.message });
    });
  }, [ready]);

  const confirmAlbum = useCallback(() => {
    void unregisterFromAlbum(albumCursor).then((res) => {
      setBag(res.bag);
      setAlbum(res.album);
      setNotice({ text: res.message });
    });
  }, [albumCursor]);

  const confirm = useCallback(() => {
    if (!ready) return;
    if (notice) {
      setNotice(null);
      return;
    }
    if (itemAction) {
      confirmItemAction();
      return;
    }
    if (albumOpen) {
      confirmAlbum();
      return;
    }
    if (bagOpen) {
      setBagOpen(false);
      return;
    }
    if (fishing) {
      hookFish();
      return;
    }
    if (exhibit) {
      if (exhibitPage < Math.min(3, exhibit.summary.length) - 1) {
        setExhibitPage((n) => n + 1);
        return;
      }
      finishExhibit();
      return;
    }
    if (choice) {
      confirmChoice();
      return;
    }
    if (talk) {
      if (talk.line + 1 < talk.npc.lines.length) {
        setTalk({ npc: talk.npc, line: talk.line + 1 });
        return;
      }
      setTalk(null);
      return;
    }
    if (isMoving) return;
    if (giveNo) {
      takeGive(giveNo);
      return;
    }
    if (canFish) {
      startFish(facing);
      return;
    }
    if (facingExhibit) {
      setExhibitPage(0);
      setExhibit(facingExhibit);
      return;
    }
    if (facingNpc) {
      setTalk({ npc: facingNpc, line: 0 });
    }
  }, [ready, notice, itemAction, albumOpen, bagOpen, fishing, talk, exhibit, exhibitPage, choice, isMoving, giveNo, takeGive, canFish, facing, facingNpc, facingExhibit, finishExhibit, confirmChoice, confirmItemAction, confirmAlbum, hookFish, startFish]);

  const onHoldStart = useCallback(
    (dir: Dir) => {
      if (notice) return;
      if (itemAction) {
        if (!itemAction.item.use || !itemAction.item.album) return;
        if (dir === "left" || dir === "up") setItemAction({ ...itemAction, pick: "use" });
        if (dir === "right" || dir === "down") setItemAction({ ...itemAction, pick: "register" });
        return;
      }
      if (albumOpen) {
        setAlbumCursor((no) => moveAlbumCursor(no, dir));
        return;
      }
      if (choice) {
        if (dir === "left" || dir === "up") setChoice({ ...choice, pick: "yes" });
        if (dir === "right" || dir === "down") setChoice({ ...choice, pick: "no" });
        return;
      }
      if (fishing || bagOpen) return;
      holdStart(dir);
    },
    [notice, itemAction, albumOpen, choice, fishing, bagOpen, holdStart],
  );

  useEffect(() => {
    setTalk(null);
    setExhibit(null);
    setExhibitPage(0);
    setChoice(null);
    setBagOpen(false);
    setAlbumOpen(false);
    setItemAction(null);
    setNotice(null);
    stopFish();
  }, [roomId, stopFish]);

  const playerBottom = py + TILE;
  const wallSprites = room.sprites.filter((s) => s.layer === "wall");
  const floorSprites = room.sprites.filter((s) => s.layer === "floor");
  const objectSprites = room.sprites.filter((s) => s.layer === "object");

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setView({ w: rect.width, h: rect.height });
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === "KeyI") {
        e.preventDefault();
        if (!e.repeat) toggleBag();
        return;
      }
      if (e.code === "KeyP") {
        e.preventDefault();
        if (!e.repeat) toggleAlbum();
        return;
      }
      if (e.code === "Escape") {
        e.preventDefault();
        if (e.repeat || !ready) return;
        if (itemAction) {
          setItemAction(null);
          return;
        }
        if (bagOpen) {
          setBagOpen(false);
          return;
        }
        if (albumOpen) {
          setAlbumOpen(false);
          return;
        }
        if (notice) {
          setNotice(null);
        }
        return;
      }
      if (e.code === "KeyX") {
        e.preventDefault();
        if (e.repeat || !ready) return;
        if (fishing) {
          hookFish();
          return;
        }
        if (isMoving || talk || exhibit || choice || bagOpen || albumOpen) return;
        if (canFish) startFish(facing);
        return;
      }
      if (e.code === "Space" || e.code === "Enter" || e.code === "KeyZ") {
        e.preventDefault();
        if (!e.repeat) confirm();
        return;
      }
      const dir = KEY_DIR[e.code];
      if (!dir) return;
      e.preventDefault();
      if (e.repeat && !albumOpen) return;
      if (busy && !choice && !albumOpen && !itemAction) return;
      onHoldStart(dir);
    };
    const onUp = (e: KeyboardEvent) => {
      const dir = KEY_DIR[e.code];
      if (!dir) return;
      holdEnd(dir);
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [holdEnd, confirm, busy, choice, onHoldStart, ready, fishing, hookFish, isMoving, talk, exhibit, bagOpen, albumOpen, itemAction, notice, canFish, startFish, facing, toggleBag, toggleAlbum]);

  return (
    <div
      ref={viewportRef}
      data-room={roomId}
      className={`fixed inset-0 overflow-hidden overscroll-none ${
        room.backdrop
          ? ""
          : room.kind === "outdoor"
            ? "bg-[#152010]"
            : "bg-[#1a1210]"
      }`}
      style={room.backdrop ? { background: room.backdrop } : undefined}
    >
      {ready ? (
        <>
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: mapW,
          height: mapH,
          transform: `translate(${cameraX}px, ${cameraY}px) scale(${CAMERA_SCALE})`,
          imageRendering: "pixelated",
        }}
      >
        <Floor room={room} />
        <Walls room={room} />
        {room.exhibits.map((item) =>
          item.cover ? (
            <div
              key={`cover-${item.id}`}
              className="pointer-events-none absolute overflow-hidden"
              style={{ ...exhibitCoverStyle(item), zIndex: 1 }}
              aria-hidden
            />
          ) : null,
        )}
        {wallSprites.map((sprite) => (
          <TileSprite key={sprite.id} sprite={sprite} zIndex={2} />
        ))}
        {floorSprites.map((sprite) => (
          <TileSprite key={sprite.id} sprite={sprite} zIndex={3} />
        ))}
        {objectSprites.map((sprite) => (
          <TileSprite
            key={sprite.id}
            sprite={sprite}
            zIndex={spriteBottomY(sprite) > playerBottom ? 12 : 8}
            onClick={
              sprite.give
                ? () => {
                    if (busy || isMoving) return;
                    if (!isAdjacentSprite(sprite, col, row)) return;
                    takeGive(sprite.give!);
                  }
                : undefined
            }
          />
        ))}
        {room.exhibits.map((item) => {
          const signPx = item.signCol * TILE;
          const signPy = item.signRow * TILE;
          return !busy && isAdjacentExhibit(item, col, row) ? (
            <EmotionBalloon
              key={`sign-emote-${item.id}`}
              emotion="exclaim"
              px={signPx}
              py={signPy}
            />
          ) : null;
        })}
        {room.npcs.map((npc) => {
          const npcBottom = (npc.row + 1) * TILE;
          const npcPx = npc.col * TILE;
          const npcPy = npc.row * TILE;
          const talkLine = talk?.npc.id === npc.id ? talk.npc.lines[talk.line] : null;
          const emotion = talkLine?.balloon
            ? talkLine.balloon
            : !busy && isAdjacentNpc(npc, col, row)
              ? "exclaim"
              : null;
          return (
            <div key={npc.id}>
              <NpcSprite
                px={npcPx}
                py={npcPy}
                facing={npc.facing}
                zIndex={npcBottom > playerBottom ? 12 : 8}
              />
              {emotion ? (
                <EmotionBalloon emotion={emotion} px={npcPx} py={npcPy} />
              ) : null}
            </div>
          );
        })}
        <Player
          px={px}
          py={py}
          facing={facing}
          walkFrame={
            fishing && (fishing.phase === "cast" || fishing.phase === "reel") ? 2 : walkFrame
          }
        />
        {fishing ? (
          <FishingFx
            px={px}
            py={py}
            facing={fishing.facing}
            phase={fishing.phase}
            startedAt={fishing.startedAt}
            success={fishing.success}
            catchSprite={fishing.catch?.sprite}
          />
        ) : null}
        {fishing?.phase === "bite" ? (
          <div className="animate-pulse">
            <EmotionBalloon emotion="exclaim" px={px} py={py} />
          </div>
        ) : null}
      </div>
      {exhibit ? (
        <ExhibitOverlay exhibit={exhibit} page={exhibitPage} onAdvance={confirm} />
      ) : null}
      {choice ? (
        <ChoiceBox
          text="해당 링크로 이동하시겠습니까?"
          pick={choice.pick}
          onPick={(pick) => setChoice({ ...choice, pick })}
          onConfirm={confirmChoice}
        />
      ) : null}
      {talk ? (
        <DialogueBox npc={talk.npc} lineIndex={talk.line} onAdvance={confirm} />
      ) : null}
      {bagOpen ? (
        <InventoryBox
          items={bagItems}
          onClose={() => {
            setBagOpen(false);
            setItemAction(null);
          }}
          onSelect={(item) => {
            if (!item.use && !item.album) {
              setNotice({
                title: item.name,
                text: item.blurb || item.name,
              });
              return;
            }
            setItemAction({ item, pick: item.use ? "use" : "register" });
          }}
        />
      ) : null}
      {albumOpen ? (
        <AlbumBox
          registered={album}
          cursor={albumCursor}
          onCursor={setAlbumCursor}
          onConfirm={confirmAlbum}
          onClose={() => setAlbumOpen(false)}
        />
      ) : null}
      {itemAction ? (
        <ItemActionBox
          item={itemAction.item}
          pick={itemAction.pick}
          onPick={(pick) => setItemAction({ ...itemAction, pick })}
          onConfirm={confirmItemAction}
        />
      ) : null}
      {notice ? (
        <NoticeBox
          title={notice.title}
          text={notice.text}
          onClose={() => setNotice(null)}
        />
      ) : null}
      {fishing?.phase === "done" ? (
        <button
          type="button"
          className="pointer-events-auto absolute inset-x-3 bottom-24 z-30 flex max-w-xl gap-3 rounded-md border-2 border-[#e8d5b0] bg-[#1a1210]/95 p-3 text-left font-dotum text-[#f4ead8] shadow-lg sm:inset-x-auto sm:bottom-8 sm:left-1/2 sm:w-[min(36rem,calc(100%-2rem))] sm:-translate-x-1/2"
          onClick={hookFish}
        >
          {fishing.success && fishing.catch ? (
            <div
              className="h-16 w-16 shrink-0 rounded-sm border border-[#e8d5b0] bg-[#2a2018]"
              style={{
                backgroundImage: `url(${fishing.catch.sprite})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "48px 48px",
                imageRendering: "pixelated",
              }}
              aria-hidden
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-base leading-relaxed">
              {fishing.success && fishing.catch
                ? `${fishing.catch.name}${objectParticle(fishing.catch.name)} 낚았다!`
                : "입질을 놓쳤다..."}
            </p>
            {fishing.success && fishing.catch ? (
              <p className="mt-1 text-sm leading-relaxed text-[#e8d5b0]/80">{fishing.catch.blurb}</p>
            ) : null}
            <p className="mt-2 text-right text-xs text-[#e8d5b0]/70">확인으로 닫기</p>
          </div>
        </button>
      ) : null}
      <DPad onHoldStart={onHoldStart} onHoldEnd={holdEnd} />
      {!talk && !exhibit && !choice && !fishing ? (
        <MenuButtons
          onAlbum={toggleAlbum}
          onBag={toggleBag}
          albumOpen={albumOpen}
          bagOpen={bagOpen}
        />
      ) : null}
      <ActionButton
        onConfirm={confirm}
        hint={Boolean(busy || facingNpc || facingExhibit || giveNo || canFish)}
      />
        </>
      ) : null}
    </div>
  );
}
