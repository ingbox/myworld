"use client";

import { useState } from "react";
import Image from "next/image";
import JukeboxNowPlaying from "@/components/shared/jukebox/JukeboxNowPlaying";
import JukeboxProgress from "@/components/shared/jukebox/JukeboxProgress";
import JukeboxQueueList from "@/components/shared/jukebox/JukeboxQueueList";
import JukeboxTransportControls from "@/components/shared/jukebox/JukeboxTransportControls";
import { useJukeboxAudio } from "@/src/hooks/jukebox/use-jukebox-audio";

export default function Jukebox() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    audioRef,
    isPlaying,
    togglePlay,
    handlePrev,
    volume,
    handleVolumeChange,
    toggleMute,
  } = useJukeboxAudio();

  return (
    <>
      <audio ref={audioRef} />
      <div className="md:max-w-52.5 w-full bg-[#eeeeee] mt-4 rounded-sm p-1 max-md:mt-1 max-sm:mb-1 max-md:max-w-auto">
        <div
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center h-4 bg-white rounded-xs px-1 py-2 cursor-pointer mb-1"
        >
          <Image src="/images/shared/jukebox/cd.png" width={12} height={12} alt="" />
          <JukeboxNowPlaying />
        </div>

        {isOpen && (
          <div className="max-md:hidden">
            <JukeboxProgress audioRef={audioRef} />
            <JukeboxQueueList />
          </div>
        )}

        <div className="flex justify-between">
          <JukeboxTransportControls
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onPrev={handlePrev}
          />

          <div className="flex items-center gap-2">
            {volume === 0 ? (
              <Image
                onClick={toggleMute}
                src="/images/shared/jukebox/volume-off.svg"
                width={12}
                height={12}
                alt="음소거 해제"
              />
            ) : (
              <Image
                onClick={toggleMute}
                src="/images/shared/jukebox/volume.svg"
                width={12}
                height={12}
                alt="음소거"
              />
            )}
            <input
              onChange={handleVolumeChange}
              value={volume}
              type="range"
              min="0"
              max="100"
              className="w-12.5 outline-none h-0.5 bg-zinc-700 accent-white appearance-none"
            />
          </div>
        </div>
      </div>
    </>
  );
}
