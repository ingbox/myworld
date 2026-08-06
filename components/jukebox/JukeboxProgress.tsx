"use client";

import { useEffect, useState } from "react";

type JukeboxProgressProps = {
  audioRef: React.RefObject<HTMLAudioElement | null>;
};

function formatTime(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export default function JukeboxProgress({ audioRef }: JukeboxProgressProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime || 0);
      const nextDuration = audio.duration;
      setDuration(Number.isFinite(nextDuration) ? Math.floor(nextDuration) : 0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateTime);
    audio.addEventListener("emptied", updateTime);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateTime);
      audio.removeEventListener("emptied", updateTime);
    };
  }, [audioRef]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
      <input
        onChange={handleSeek}
        value={currentTime}
        type="range"
        min="0"
        max={duration || 0}
        style={{
          background: `linear-gradient(to right, #2563eb ${progress}%, #cccccc ${progress}%)`,
        }}
        className="jukebox-range w-full outline-none h-0.5 bg-zinc-700 appearance-none"
      />
      <span className="text-xs text-gray-400">{formatTime(duration)}</span>
    </div>
  );
}
