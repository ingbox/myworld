"use client";

import { useEffect, useRef, useState } from "react";
import {
  selectCurrentIndex,
  selectCurrentTrack,
  selectPlayNext,
  selectPlayPrev,
  selectQueueLength,
  usePlayerStore,
} from "@/stores/usePlayerStore";

export function useJukeboxAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedQueueIdRef = useRef<string | null>(null);
  const suppressAutoPlayRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [previousVolume, setPreviousVolume] = useState(0);

  const queueLength = usePlayerStore(selectQueueLength);
  const currentIndex = usePlayerStore(selectCurrentIndex);
  const currentTrack = usePlayerStore(selectCurrentTrack);
  const playNext = usePlayerStore(selectPlayNext);
  const playPrev = usePlayerStore(selectPlayPrev);

  useEffect(() => {
    const markRestoredQueue = () => {
      if (usePlayerStore.getState().queue.length > 0) {
        suppressAutoPlayRef.current = true;
      }
    };

    if (usePlayerStore.persist.hasHydrated()) {
      markRestoredQueue();
      return;
    }

    return usePlayerStore.persist.onFinishHydration(markRestoredQueue);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current || queueLength === 0) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const { queue: latestQueue, currentIndex: latestIndex } =
        usePlayerStore.getState();

      if (latestIndex >= latestQueue.length - 1) {
        setIsPlaying(false);
        return;
      }

      playNext();
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [playNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (queueLength === 0) {
      loadedQueueIdRef.current = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setIsPlaying(false);
      return;
    }

    if (!currentTrack) return;

    if (loadedQueueIdRef.current === currentTrack.queueId) {
      return;
    }

    loadedQueueIdRef.current = currentTrack.queueId;
    audio.src = currentTrack.download_url;

    if (suppressAutoPlayRef.current) {
      suppressAutoPlayRef.current = false;
      setIsPlaying(false);
      return;
    }

    audio.play();
    setIsPlaying(true);
  }, [
    queueLength,
    currentIndex,
    currentTrack?.queueId,
    currentTrack?.download_url,
  ]);

  const handlePrev = () => {
    if (!audioRef.current) return;
    if (audioRef.current.currentTime > 1) {
      audioRef.current.currentTime = 0;
    } else {
      playPrev();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value, 10);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol / 100;
    }
  };

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(previousVolume);
      if (audioRef.current) {
        audioRef.current.volume = previousVolume / 100;
      }
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    }
  };

  return {
    audioRef,
    isPlaying,
    togglePlay,
    handlePrev,
    volume,
    handleVolumeChange,
    toggleMute,
  };
}
