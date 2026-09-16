'use client';

import { createDrawing } from "@/src/lib/api/orm/action";
import { getRandomCat } from "@/src/lib/api/orm/service";
import type { CatData } from "@/src/lib/api/orm/types";
import { selectAddDrawing, useCatDrawingStore } from "@/src/stores/useCatDrawingStore";
import { useRef, useState } from "react";

export default function CatCanvas({ initialCat }: { initialCat: CatData | null }) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawing, setDrawing] = useState<boolean>(false);
    const [color, setColor] = useState<string>("#a78bfa");
    const [lineWidth, setLineWidth] = useState<number>(4);
    const [tool, setTool] = useState<"pen" | "eraser">("pen");
    const [score, setScore] = useState<number | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [reference, setReference] = useState<CatData | null>(initialCat);
    const [refreshing, setRefreshing] = useState(false);
    const addDrawing = useCatDrawingStore(selectAddDrawing);
    const lastPos = useRef<{ x: number, y: number } | null>(null);
    const CANVAS_W = 800;
    const CANVAS_H = 420;

    const colors = ["#a78bfa", "#f472b6", "#34d399", "#60a5fa", "#fb923c", "#fbbf24", "#e2e8f0", "#1e293b"];

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if ("touches" in e) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY,
            }
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        }
    };

    function startDraw(e: React.MouseEvent | React.TouchEvent) {
        e.preventDefault();
        setDrawing(true);
        const pos = getPos(e);
        lastPos.current = pos;
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, (tool === "eraser" ? lineWidth * 4 : lineWidth) / 2, 0, Math.PI * 2);
        ctx.fillStyle = tool === "eraser" ? "#0f172a" : color;
        ctx.fill();
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!drawing) return;
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx || !lastPos.current) return;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = tool === "eraser" ? "#0f172a" : color;
        ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        lastPos.current = pos;
    };

    const stopDraw = () => {
        setDrawing(false);
        lastPos.current = null;
    };

    const clearCanvas = () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasRef.current?.width ?? 0, canvasRef.current?.height ?? 0);
        setScore(null);
        setUploadError(null);
    };

    const toPngFile = (canvas: HTMLCanvasElement) =>
        new Promise<File | null>((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob ? new File([blob], "drawing.png", { type: "image/png" }) : null);
            }, "image/png");
        });

    const handleUpload = async () => {
        const canvas = canvasRef.current;
        if (!canvas || !reference || uploading) return;

        setUploading(true);
        setUploadError(null);
        try {
            const file = await toPngFile(canvas);
            if (!file) throw new Error("그림을 이미지로 만들지 못했습니다.");

            const { drawing } = await createDrawing({ catId: reference.id, file });
            setScore(drawing.score);
            addDrawing(drawing);
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "업로드에 실패했습니다.");
        } finally {
            setUploading(false);
        }
    };

    const refreshReference = async () => {
        if (refreshing) return;
        setRefreshing(true);
        try {
            const next = await getRandomCat(reference ? [reference.id] : []);
            if (next) setReference(next);
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <section id="canvas" className="mb-16 px-8 mx-auto">
            <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    POST
                </span>
                <h2 className="text-2xl font-semibold text-slate-100">/cats/drawings</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6 ml-16 font-mono">
                Copy the cat on the left onto the canvas.
            </p>

            <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800/80">
                    <span className="text-xs font-mono text-slate-400">Request body: multipart/form-data</span>
                    <span className="text-xs font-mono text-slate-500">image/png</span>
                </div>

                <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-700/50 flex-wrap">
                    <div className="flex gap-1.5">
                        {colors.map((c) => (
                            <button
                                key={c}
                                onClick={() => { setColor(c); setTool("pen"); }}
                                style={{ background: c }}
                                className={`w-6 h-6 rounded-full border-2 transition-all ${color === c && tool === "pen" ? "border-white scale-110" : "border-transparent hover:scale-105"
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="w-px h-6 bg-slate-700" />
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-mono">size</span>
                        <input
                            type="range" min="2" max="24" value={lineWidth}
                            onChange={(e) => setLineWidth(Number(e.target.value))}
                            className="w-20 accent-violet-500"
                        />
                        <span className="text-xs text-slate-400 font-mono w-4">{lineWidth}</span>
                    </div>
                    <div className="w-px h-6 bg-slate-700" />
                    <button
                        onClick={() => setTool(tool === "eraser" ? "pen" : "eraser")}
                        className={`px-3 py-1 rounded text-xs font-mono transition-all ${tool === "eraser" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            }`}
                    >
                        {tool === "eraser" ? "🧹 eraser" : "✏️ pen"}
                    </button>
                    <button
                        onClick={clearCanvas}
                        className="px-3 py-1 rounded text-xs font-mono bg-slate-700 text-slate-400 hover:bg-slate-600 transition-all ml-auto"
                    >
                        clear
                    </button>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div
                            className="relative overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900"
                            style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
                        >
                            {reference ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={reference.url}
                                    alt="Reference cat"
                                    className="absolute inset-0 h-full w-full object-contain"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center font-mono text-xs text-slate-500">
                                    no reference
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={refreshReference}
                                disabled={refreshing}
                                className="absolute top-2 right-2 rounded-lg border border-slate-600 bg-slate-950/80 px-2 py-1 font-mono text-xs text-slate-200 hover:border-violet-500/50 hover:text-violet-300 disabled:opacity-50"
                            >
                                {refreshing ? "..." : "↻"}
                            </button>
                            <span className="absolute bottom-2 left-2 rounded bg-slate-950/70 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                                reference
                            </span>
                        </div>
                        <canvas
                            ref={canvasRef}
                            width={CANVAS_W}
                            height={CANVAS_H}
                            className="w-full rounded-lg bg-slate-900 border border-slate-700/50"
                            style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
                            onMouseDown={startDraw}
                            onMouseMove={draw}
                            onMouseUp={stopDraw}
                            onMouseLeave={stopDraw}
                            onTouchStart={startDraw}
                            onTouchMove={draw}
                            onTouchEnd={stopDraw}
                        />
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                        <button
                            onClick={handleUpload}
                            disabled={uploading || !reference}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                        >
                            <span>↑</span> {uploading ? "Scoring..." : "Upload Drawing"}
                        </button>
                        {score !== null && (
                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-mono">
                                <span>✓</span> 201 Created — CLIP score{" "}
                                <span className="text-lg font-semibold text-violet-300">{score}</span>
                                <span className="text-slate-500">/ 100</span>
                            </div>
                        )}
                        {uploadError && (
                            <div className="flex items-center gap-2 text-rose-400 text-sm font-mono">
                                <span>✕</span> {uploadError}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
