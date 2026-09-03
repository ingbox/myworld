"use client";

import {
  selectCurrentTrack,
  usePlayerStore,
} from "@/src/stores/usePlayerStore";

export default function JukeboxNowPlaying() {
  const currentTrack = usePlayerStore(selectCurrentTrack);

  return (
    <div className="ml-2 w-42 overflow-hidden max-md:w-full">
      <div
        key={currentTrack?.queueId}
        className="text-xs text-gray-500 marquee whitespace-nowrap"
      >
        {currentTrack?.title}
      </div>
    </div>
  );
}
