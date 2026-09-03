"use client";

import Image from "next/image";
import {
  selectPlayNext,
  selectQueueLength,
  usePlayerStore,
} from "@/src/stores/usePlayerStore";

type JukeboxTransportControlsProps = {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
};

export default function JukeboxTransportControls({
  isPlaying,
  onTogglePlay,
  onPrev,
}: JukeboxTransportControlsProps) {
  const queueLength = usePlayerStore(selectQueueLength);
  const playNext = usePlayerStore(selectPlayNext);
  const hasQueue = queueLength > 0;

  return (
    <div className="flex gap-2">
      <Image
        onClick={hasQueue ? onPrev : undefined}
        className={hasQueue ? "cursor-pointer" : "cursor-not-allowed opacity-40"}
        src="/images/shared/jukebox/skipback.svg"
        width={10}
        height={10}
        alt="이전 곡"
      />
      <Image
        onClick={hasQueue ? onTogglePlay : undefined}
        className={hasQueue ? "cursor-pointer" : "cursor-not-allowed opacity-40"}
        src={isPlaying ? "/images/shared/jukebox/stop.svg" : "/images/shared/jukebox/play.svg"}
        width={8}
        height={8}
        alt={isPlaying ? "일시정지" : "재생"}
      />
      <Image
        onClick={hasQueue ? playNext : undefined}
        className={hasQueue ? "cursor-pointer" : "cursor-not-allowed opacity-40"}
        src="/images/shared/jukebox/skipforward.svg"
        width={10}
        height={10}
        alt="다음 곡"
      />
    </div>
  );
}
