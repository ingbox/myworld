'use client';

import { useCallback, useEffect, useRef, useState } from "react";

type SoundBubble = {
    id: number;
    text: string;
    top: number;
    duration: number;
    delay: number;
    fontSize: number;
    color: string;
    reverse: boolean;
    driftY: number;
    driftR: number;
};

type CatSound = {
    id: string;
    text: string;
    createdAt: number;
    ambient?: boolean;
};

const BUBBLE_COLORS = ["#f472b6", "#a78bfa", "#34d399", "#60a5fa", "#fb923c", "#fbbf24", "#e2e8f0"];
const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;
const ROOM_ID = "cats-sounds";

function toBubble(text: string, id: number): SoundBubble {
    return {
        id,
        text,
        top: 5 + Math.random() * 80,
        duration: 8 + Math.random() * 10,
        delay: Math.random() * -8,
        fontSize: 12 + Math.floor(Math.random() * 20),
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        reverse: Math.random() > 0.5,
        driftY: (Math.random() - 0.5) * 60,
        driftR: (Math.random() - 0.5) * 20,
    };
}

export default function CatSounds() {
    const [bubbles, setBubbles] = useState<SoundBubble[]>([]);
    const [input, setInput] = useState("");
    const [connected, setConnected] = useState(false);
    const [received, setReceived] = useState(0);
    const [emitting, setEmitting] = useState(false);
    const counterRef = useRef(0);
    const seenIds = useRef(new Set<string>());

    const spawnBubble = useCallback((text: string) => {
        const id = counterRef.current++;
        setBubbles((prev) => [...prev.slice(-60), toBubble(text, id)]);
    }, []);

    const receiveSound = useCallback((sound: CatSound, copies = 1) => {
        if (seenIds.current.has(sound.id)) return;
        seenIds.current.add(sound.id);
        if (seenIds.current.size > 300) {
            seenIds.current = new Set([...seenIds.current].slice(-150));
        }
        setReceived((n) => n + 1);
        for (let i = 0; i < copies; i++) {
            setTimeout(() => spawnBubble(sound.text), i * 300);
        }
    }, [spawnBubble]);

    useEffect(() => {
        const socket = new WebSocket(`${WS_URL}/ws/${ROOM_ID}`);

        socket.onopen = () => {
            setConnected(true);
        };

        socket.onmessage = (event) => {
            const sound: CatSound = JSON.parse(event.data);
            receiveSound(sound, sound.ambient ? 1 : 3);
        };

        socket.onclose = () => {
            setConnected(false);
        };

        return () => socket.close();
    }, [receiveSound]);

    useEffect(() => {
        let cancelled = false;

        fetch(`${API_URL}/cat-sounds`)
            .then((res) => res.json())
            .then((sounds: CatSound[]) => {
                if (cancelled || !Array.isArray(sounds)) return;
                for (const sound of sounds.slice(-20)) {
                    receiveSound(sound, 1);
                }
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, [receiveSound]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || emitting) return;

        setEmitting(true);
        setInput("");
        try {
            const res = await fetch(`${API_URL}/cat-sound`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            if (!res.ok) throw new Error("emit failed");
        } catch {
            setInput(text);
        } finally {
            setEmitting(false);
        }
    };

    return (
        <section id="sounds" className="mb-16 px-8 mx-auto">
            <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    WS
                </span>
                <h2 className="text-2xl font-semibold text-slate-100">/cats/sounds</h2>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-6 font-mono text-sm">
                <div className="text-slate-500 text-xs mb-3 uppercase tracking-wider">Request</div>
                <div className="text-slate-300">
                    <span className="text-pink-400 font-semibold">ws</span>
                    <span className="text-slate-500">.</span>
                    <span className="text-sky-400">subscribe</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                    channel=<span className="text-amber-400">/ws/{ROOM_ID}</span>
                    {" "}cache=<span className="text-emerald-400">redis 2h</span>
                </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800/80">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                        <span className={`text-xs font-mono ${connected ? "text-emerald-400" : "text-slate-500"}`}>
                            {connected ? "CONNECTED" : "DISCONNECTED"}
                        </span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">{received} messages received</span>
                </div>

                <div
                    className="relative overflow-hidden bg-slate-900 border-b border-slate-700"
                    style={{ height: 320 }}
                >
                    {bubbles.map((b) => (
                        <div
                            key={b.id}
                            className="sound-bubble font-mono font-semibold select-none"
                            style={{
                                top: `${b.top}%`,
                                fontSize: b.fontSize,
                                color: b.color,
                                animationName: b.reverse ? "float-across-reverse" : "float-across",
                                animationDuration: `${b.duration}s`,
                                animationDelay: `${b.delay}s`,
                                "--drift-y": `${b.driftY}px`,
                                "--drift-r": `${b.driftR}deg`,
                                textShadow: `0 0 20px ${b.color}60`,
                            } as React.CSSProperties}
                        >
                            {b.text}
                        </div>
                    ))}
                    <div className="absolute inset-y-0 left-0 w-16 bg-linear-to-r from-slate-900 to-transparent pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-16 bg-linear-to-l from-slate-900 to-transparent pointer-events-none" />
                </div>

                <div className="p-4">
                    <div className="text-xs font-mono text-slate-500 mb-2">emit message</div>
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">{">"}</span>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="야옹... 먀... 냥냥냥..."
                                className="w-full pl-7 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-pink-500/60 transition-colors"
                                maxLength={30}
                                disabled={!connected}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!connected || emitting}
                            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-sm font-medium rounded-lg transition-all whitespace-nowrap disabled:opacity-50"
                        >
                            Emit 📡
                        </button>
                    </form>
                    <p className="text-slate-600 text-xs font-mono mt-2">
                        Redis cache, 2h TTL. Max 30 characters.
                    </p>
                </div>
            </div>
        </section>
    );
}
