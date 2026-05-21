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
        if(!audioRef.current) return;

        if(isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying)
    }

    useEffect(() => {
        const audio = audioRef.current;
        if(!audio) return;

        const updateTime = () => {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration | 0)
        }

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateTime);
    },[]);

    const formatTime = (time : number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, "0");

        return `${minutes}:${seconds}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);

        if(audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };
    
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseInt(e.target.value);
        setVolume(vol);
        if(audioRef.current) {
            audioRef.current.volume = vol / 100;
        }
    }

    const toggleMute = () => {
        if(volume === 0) {
            setVolume(previousVolume);
            if(audioRef.current) {
                audioRef.current.volume = previousVolume / 100;
            } 
        } else {

            setPreviousVolume(volume);
            setVolume(0);
            if(audioRef.current) {
                audioRef.current.volume = 0;
            }
        }
    }

    return (
        <>
            {/* 오디오 플레이어 */}
            <audio src="/audios/audio1.mp3" ref={audioRef}></audio>
            <div className="w-full bg-[#eeeeee] mt-2 rounded-sm p-1">
                <div 
                    onClick={()=> setIsOpen(prev => !prev)}
                    className="flex items-center h-4 bg-white rounded-xs p-2 cursor-pointer"
                >
                    <Image src="/images/jukebox/cd.png" width={12} height={12} alt=""/>
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
                            className=""
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
                        <Image src="/images/jukebox/skipback.svg" width={10} height={10} alt="" />
                        <Image 
                        onClick={togglePlayButton}
                        src={isPlaying ? '/images/jukebox/stop.svg':'/images/jukebox/play.svg'} width={8} height={8} alt="" />
                        <Image src="/images/jukebox/skipforward.svg" width={10} height={10} alt="" />
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
                            className="w-[50px] outline-none h-[2px] bg-zinc-700 accent-white appearance-none"/>
                          {/* 주크박스 페이지 이동 */}
                        <div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}