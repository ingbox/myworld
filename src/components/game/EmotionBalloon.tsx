"use client";

import { useEffect, useState } from "react";
import { TILE } from "@/src/util/main/chip";
import {
  EMOTE_FRAME_MS,
  EMOTE_SHEET,
  emoteBackground,
} from "@/src/util/main/emotion";

type Props = {
  emotion: string;
  px: number;
  py: number;
  zIndex?: number;
};

export default function EmotionBalloon({
  emotion,
  px,
  py,
  zIndex = 22,
}: Props) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);
    let next = 0;
    const id = window.setInterval(() => {
      next += 1;
      if (next >= EMOTE_SHEET.cols - 1) {
        setFrame(EMOTE_SHEET.cols - 1);
        window.clearInterval(id);
        return;
      }
      setFrame(next);
    }, EMOTE_FRAME_MS);
    return () => window.clearInterval(id);
  }, [emotion]);

  const size = EMOTE_SHEET.frame;

  return (
    <div
      data-emote={emotion}
      className="pointer-events-none absolute"
      style={{
        left: px + TILE / 2 - size / 2,
        top: py - size + 4,
        zIndex,
        ...emoteBackground(emotion, frame),
      }}
      aria-hidden
    />
  );
}
