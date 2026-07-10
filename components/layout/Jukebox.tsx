'use client'
import { useRef, useState, useEffect } from "react";
import Image from "next/image"
import { usePlayerStore } from "@/stores/usePlayerStore"

export default function Jukebox() {

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [volume, setVolume] = useState(50);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [previousVolume, setPreviousVolume] = useState(0);

    const progress = duration ? (currentTime / duration) * 100 : 0;

    const { queue, currentIndex, playNext, playPrev } = usePlayerStore()

    const togglePlayButton = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying)
    }

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration | 0)
        }

        const handleEnded = () => {
            if (queue[currentIndex + 1] == undefined) {
                setIsPlaying(false);
            } else {
                playNext();
            }
        };

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateTime);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateTime);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [queue, playNext]);

    useEffect(() => {
        if (!audioRef.current) return;
        if (!queue[currentIndex]) return;

        audioRef.current.src = queue[currentIndex].download_url;
        audioRef.current.play();

        setIsPlaying(true);
    }, [currentIndex, queue]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, "0");

        return `${minutes}:${seconds}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);

        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    // UX 1초 이전에 이전 버튼 누르면 이전곡 아니면 처음부터 재생
    const handlePrev = () => {
        if (!audioRef.current) return;
        if (audioRef.current.currentTime > 1) {
            audioRef.current.currentTime = 0;
        } else {
            playPrev();
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseInt(e.target.value);
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol / 100;
        }
    }

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
    }

    return (
        <>
            {/* 오디오 플레이어 */}
            <audio src={queue[currentIndex]?.download_url} ref={audioRef}></audio>
            <div className="w-full bg-[#eeeeee] mt-4 rounded-sm p-1">
                <div
                    onClick={() => setIsOpen(prev => !prev)}
                    className="flex items-center h-4 bg-white rounded-xs px-1 py-2 cursor-pointer mb-1"
                >
                    <Image src="/images/jukebox/cd.png" width={12} height={12} alt="" />
                    <div className="ml-2 w-42 overflow-hidden">
                        <div
                            key={queue[currentIndex]?.id}
                            className="text-xs text-gray-500 marquee whitespace-nowrap">
                            {queue[currentIndex]?.title}
                        </div>
                    </div>
                </div>
                {
                    isOpen && (
                        <div>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
                                <input
                                    onChange={handleSeek}
                                    value={currentTime}
                                    type="range"
                                    min="0"
                                    max={duration || 0}
                                    style={{
                                        background: `linear-gradient(to right, #2563eb ${progress}%, #cccccc ${progress}%)`
                                    }}
                                    className="jukebox-range w-full outline-none h-[2px] bg-zinc-700 appearance-none"
                                />
                                <span className="text-xs text-gray-400">{formatTime(duration)}</span>
                            </div>
                            {queue.length === 0 ? (
                                <div className="text-xs text-gray-400">재생 목록이 비어있음</div>
                            ) : (
                                queue.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="text-xs text-gray-500 truncate"
                                    >
                                        {item.title ?? `track ${idx}`}
                                    </div>
                                ))
                            )}

                        </div>
                    )
                }

                <div className="flex justify-between">
                    {/* 플레이 조절 */}
                    <div className="flex gap-2">
                        <Image
                            onClick={handlePrev}
                            className="cursor-pointer"
                            src="/images/jukebox/skipback.svg" width={10} height={10} alt="" />
                        <Image
                            onClick={togglePlayButton}
                            className="cursor-pointer"
                            src={isPlaying ? '/images/jukebox/stop.svg' : '/images/jukebox/play.svg'} width={8} height={8} alt="" />
                        <Image
                            onClick={playNext}
                            className="cursor-pointer"
                            src="/images/jukebox/skipforward.svg" width={10} height={10} alt="" />
                    </div>
                    {/* 음량 조절 */}
                    <div className="flex items-center gap-2">
                        {
                            volume === 0 ?
                                <Image
                                    onClick={toggleMute}
                                    src="/images/jukebox/volume-off.svg"
                                    width={12}
                                    height={12}
                                    alt=""
                                />
                                :
                                <Image
                                    onClick={toggleMute}
                                    src="/images/jukebox/volume.svg"
                                    width={12}
                                    height={12}
                                    alt=""
                                />
                        }
                        <input
                            onChange={handleVolumeChange}
                            value={volume}
                            type="range"
                            min="0"
                            max="100"
                            className="w-[50px] outline-none h-[2px] bg-zinc-700 accent-white appearance-none" />
                        {/* 주크박스 페이지 이동 */}
                        <div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}