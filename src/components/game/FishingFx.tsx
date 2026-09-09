"use client";

import { useEffect, useState } from "react";
import { DIR_DELTA, TILE, type Dir } from "@/src/util/main/chip";
import { FISH_CAST_MS, type FishPhase } from "@/src/util/main/fish";

type Props = {
  px: number;
  py: number;
  facing: Dir;
  phase: FishPhase;
  startedAt: number;
  success: boolean;
  catchSprite?: string | null;
};

const HAND: Record<Dir, { x: number; y: number }> = {
  down: { x: 18, y: 20 },
  up: { x: 14, y: 14 },
  left: { x: 8, y: 18 },
  right: { x: 24, y: 18 },
};

/** CSS rotate. 0도는 위쪽. */
const ROD_WAIT: Record<Dir, number> = {
  down: 180,
  up: 0,
  left: -90,
  right: 90,
};

const ROD_WINDUP: Record<Dir, number> = {
  down: 230,
  up: -50,
  left: -150,
  right: 150,
};

/** 시트 아이콘이 이미 오른쪽 위로 기울어 있어서 손잡이가 아래가 되게 보정합니다. */
const SPRITE_TILT = -39;
const ROD = 24;
/** 55px 아이콘에서 손잡이·끝 좌표. */
const HANDLE = { x: 6 / 55, y: 53 / 55 };
const TIP = { x: 46 / 55, y: 4 / 55 };
const BOBBER = 10;
const FISH = 20;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * 화면 좌표에서 CSS rotate(시계 방향) 뒤의 점을 구합니다.
 *
 * @param originX - 회전 중심 x
 * @param originY - 회전 중심 y
 * @param localX - 중심 기준 x
 * @param localY - 중심 기준 y
 * @param deg - CSS 각도
 */
function rotateCss(
  originX: number,
  originY: number,
  localX: number,
  localY: number,
  deg: number,
) {
  const rad = (deg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return {
    x: originX + localX * c - localY * s,
    y: originY + localX * s + localY * c,
  };
}

/**
 * 낚싯대·줄·찌·물보라를 캐릭터 위에 그립니다.
 */
export default function FishingFx({ px, py, facing, phase, startedAt, success, catchSprite }: Props) {
  const [now, setNow] = useState(() => performance.now());

  useEffect(() => {
    if (phase !== "cast") return;
    let id = 0;
    const tick = (t: number) => {
      setNow(t);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [phase]);

  const castT = Math.min(1, Math.max(0, (now - startedAt) / FISH_CAST_MS));
  const ease = 1 - (1 - castT) * (1 - castT);
  const rodAngle =
    (phase === "cast"
      ? lerp(ROD_WINDUP[facing], ROD_WAIT[facing], ease)
      : phase === "reel"
        ? ROD_WINDUP[facing]
        : ROD_WAIT[facing]) + SPRITE_TILT;

  const hand = HAND[facing];
  const originX = px + hand.x;
  const originY = py + hand.y;
  const dist = TILE * 1.7;
  const targetX = px + TILE / 2 + DIR_DELTA[facing].dc * dist;
  const targetY = py + TILE / 2 + DIR_DELTA[facing].dr * dist;
  const bobberX = phase === "cast" ? lerp(originX, targetX, ease) : targetX;
  const bobberY = phase === "cast" ? lerp(originY, targetY, ease) : targetY;
  const tip = rotateCss(
    originX,
    originY,
    ROD * (TIP.x - HANDLE.x),
    ROD * (TIP.y - HANDLE.y),
    rodAngle,
  );
  const lineFrom = phase === "cast" && ease < 0.2 ? { x: originX, y: originY } : tip;
  const showSplash = (phase === "cast" && ease > 0.82) || phase === "wait";
  const splashOnce = phase === "cast" && ease > 0.82;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className="absolute"
        style={{
          left: originX - ROD * HANDLE.x,
          top: originY - ROD * HANDLE.y,
          width: ROD,
          height: ROD,
          backgroundImage: "url(/images/game/fishing-rod.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: `${ROD}px ${ROD}px`,
          imageRendering: "pixelated",
          transformOrigin: `${ROD * HANDLE.x}px ${ROD * HANDLE.y}px`,
          transform: `rotate(${rodAngle}deg)`,
          zIndex: 11,
        }}
      />
      {phase !== "done" ? (
        <div
          className="absolute h-px origin-left bg-[#cfd6de]"
          style={{
            left: lineFrom.x,
            top: lineFrom.y,
            width: Math.hypot(bobberX - lineFrom.x, bobberY - lineFrom.y),
            transform: `rotate(${Math.atan2(bobberY - lineFrom.y, bobberX - lineFrom.x)}rad)`,
            zIndex: 10,
          }}
        />
      ) : null}
      {phase !== "done" && phase !== "reel" ? (
        <div
          className="absolute"
          style={{
            left: bobberX - BOBBER / 2,
            top: bobberY - BOBBER / 2,
            width: BOBBER,
            height: BOBBER,
            backgroundImage: "url(/images/game/fishing-bobber.png)",
            backgroundSize: `${BOBBER}px ${BOBBER}px`,
            imageRendering: "pixelated",
            animation:
              phase === "bite"
                ? "fish-bob-hit 0.18s ease-in-out infinite"
                : phase === "wait"
                  ? "fish-bob 0.9s ease-in-out infinite"
                  : undefined,
            zIndex: 11,
          }}
        />
      ) : null}
      {showSplash ? (
        <div
          className="absolute rounded-full border-2 border-white/80"
          style={{
            left: targetX - 10,
            top: targetY - 6,
            width: 20,
            height: 12,
            animation: splashOnce ? "fish-splash 0.45s ease-out" : undefined,
            opacity: splashOnce ? undefined : 0,
            zIndex: 9,
          }}
        />
      ) : null}
      {phase === "done" && success && catchSprite ? (
        <div
          className="absolute"
          style={{
            left: px + (TILE - FISH) / 2,
            top: py - 18,
            width: FISH,
            height: FISH,
            backgroundImage: `url(${catchSprite})`,
            backgroundSize: `${FISH}px ${FISH}px`,
            imageRendering: "pixelated",
            zIndex: 13,
          }}
        />
      ) : null}
    </div>
  );
}
