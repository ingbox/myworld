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
    const loadedQueueIdRef = useRef<string | null>(null);

    const { queue, currentIndex, playNext, playPrev, removeFromQueue } = usePlayerStore()
    const currentTrack = queue[currentIndex];

    const togglePlayButton = () => {
        if (!audioRef.current || queue.length === 0) return;

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
            const { queue: latestQueue, currentIndex: latestIndex } = usePlayerStore.getState();

            if (latestIndex >= latestQueue.length - 1) {
                setIsPlaying(false);
                return;
            }

            playNext();
        };

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateTime);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateTime);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [playNext]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (queue.length === 0) {
            loadedQueueIdRef.current = null;
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
            return;
        }

        if (!currentTrack) return;

        // 큐에만 곡 추가된 경우 — 현재 재생 중인 트랙이면 src 재설정하지 않음
        if (loadedQueueIdRef.current === currentTrack.queueId) {
            return;
        }

        loadedQueueIdRef.current = currentTrack.queueId;
        audio.src = currentTrack.download_url;
        audio.play();
        setIsPlaying(true);
    }, [queue.length, currentIndex, currentTrack?.queueId, currentTrack?.download_url]);

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

    const handleDelete = (queueId: string) => {
        removeFromQueue(queueId);
    }

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
            <audio ref={audioRef} />
            <div className="md:max-w-[210px] w-full bg-[#eeeeee] mt-4 rounded-sm p-1 max-md:mt-1 max-sm:mb-1">
                <div
                    onClick={() => setIsOpen(prev => !prev)}
                    className="flex items-center h-4 bg-white rounded-xs px-1 py-2 cursor-pointer mb-1"
                >
                    <Image src="/images/jukebox/cd.png" width={12} height={12} alt="" />
                    <div className="ml-2 w-42 overflow-hidden">
                        <div
                            key={currentTrack?.queueId}
                            className="text-xs text-gray-500 marquee whitespace-nowrap">
                            {currentTrack?.title}
                        </div>
                    </div>
                </div>
                {
                    isOpen && (
                        <div className="max-md:hidden">
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
                                queue.map((item) => (
                                    <div key={item.queueId} className="flex items-center justify-between">
                                        <div
                                            className="text-xs text-gray-500 truncate"
                                        >
                                            {item.title ?? 'track'}
                                        </div>

                                        <svg
                                            width="13"
                                            height="13"
                                            viewBox="0 0 100 100"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="inline align-middle ml-1 cursor-pointer shrink-0"
                                            style={{ verticalAlign: 'middle' }}
                                            onClick={() => handleDelete(item.queueId)}
                                        >
                                            <rect width="100" height="100" fill="transparent" stroke="#6B7280" strokeWidth="5" />
                                            <line x1="20" y1="20" x2="80" y2="80" stroke="#6B7280" strokeWidth="5" />
                                            <line x1="80" y1="20" x2="20" y2="80" stroke="#6B7280" strokeWidth="5" />
                                        </svg>
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