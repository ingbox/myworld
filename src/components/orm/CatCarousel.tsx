'use client';

import { useMemo, useState } from "react";

import { getDrawingList } from "@/src/lib/api/orm/service";
import type { CatDrawingData, CatDrawingListResult } from "@/src/lib/api/orm/types";
import { selectUploaded, useCatDrawingStore } from "@/src/stores/useCatDrawingStore";

/** 카드 한 장이 지나가는 데 걸리는 시간. 장수가 늘면 그만큼 길어집니다. */
const SECONDS_PER_CARD = 3;
/** 장수가 적어도 트랙이 화면 폭을 넘도록 목록을 이만큼 채웁니다. */
const MIN_CARDS = 6;

export default function CatCarousel({
    initialDrawings,
    initialTotal,
}: {
    initialDrawings: CatDrawingData[];
    initialTotal: number;
}) {
    const [fetched, setFetched] = useState<CatDrawingData[]>(initialDrawings);
    const [totalCount, setTotalCount] = useState<number>(initialTotal);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const uploaded = useCatDrawingStore(selectUploaded);

    // 업로드 직후 추가된 그림을 앞에 붙이고, 새로고침으로 겹친 건 걸러냅니다.
    const drawings = useMemo(() => {
        const ids = new Set<number>();
        return [...uploaded, ...fetched].filter((drawing) => {
            if (ids.has(drawing.id)) return false;
            ids.add(drawing.id);
            return true;
        });
    }, [uploaded, fetched]);

    // 한 바퀴 분량. 목록이 짧으면 반복해서 트랙을 채웁니다.
    const loop = useMemo(() => {
        if (drawings.length === 0) return [];
        const repeats = Math.ceil(MIN_CARDS / drawings.length);
        return Array.from({ length: repeats }, () => drawings).flat();
    }, [drawings]);

    const refresh = async () => {
        if (refreshing) return;
        setRefreshing(true);
        try {
            const result: CatDrawingListResult = await getDrawingList();
            setFetched(result.drawings);
            setTotalCount(result.totalCount);
        } finally {
            setRefreshing(false);
        }
    };

    const total = Math.max(totalCount, drawings.length);

    return (
        <section id="drawings" className="mb-16 px-8 mx-auto">
            <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    GET
                </span>
                <h2 className="text-2xl font-semibold text-slate-100">/cats/drawings</h2>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-6 font-mono text-sm">
                <div className="text-slate-500 text-xs mb-3 uppercase tracking-wider">Request</div>
                <div className="text-slate-300">
                    <span className="text-emerald-400 font-semibold">prisma</span>
                    <span className="text-slate-500">.catDrawing.</span>
                    <span className="text-sky-400">findMany</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                    take=<span className="text-amber-400">30</span>
                    {" "}orderBy=<span className="text-emerald-400">createdAt desc</span>
                    {" "}include=<span className="text-violet-300">cat</span>
                </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800/80">
                    <span className="text-xs font-mono text-slate-400">
                        200 OK · <span className="text-emerald-400">{total}</span> drawings
                    </span>
                    <button
                        type="button"
                        onClick={refresh}
                        disabled={refreshing}
                        className="rounded border border-slate-600 px-2 py-0.5 font-mono text-xs text-slate-300 hover:border-violet-500/50 hover:text-violet-300 disabled:opacity-50"
                    >
                        {refreshing ? "..." : "↻ refresh"}
                    </button>
                </div>

                {drawings.length === 0 ? (
                    <div className="flex h-40 items-center justify-center font-mono text-xs text-slate-500">
                        아직 업로드된 그림이 없습니다. 위에서 한 장 그려보세요.
                    </div>
                ) : (
                    <div className="relative overflow-hidden py-4">
                        <div
                            className="flex w-max gap-4 hover:[animation-play-state:paused]"
                            style={{
                                animation: `orm-drawing-marquee ${loop.length * SECONDS_PER_CARD}s linear infinite`,
                            }}
                        >
                            {/* 절반만큼 밀어 순환시키려면 같은 목록이 두 벌 필요합니다. */}
                            {[...loop, ...loop].map((drawing, index) => (
                                <DrawingCard
                                    key={`${drawing.id}-${index}`}
                                    drawing={drawing}
                                    rank={(index % drawings.length) + 1}
                                />
                            ))}
                        </div>
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-slate-800/90 to-transparent" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-slate-800/90 to-transparent" />
                    </div>
                )}
            </div>
        </section>
    );
}

function DrawingCard({ drawing, rank }: { drawing: CatDrawingData; rank: number }) {
    return (
        <figure className="w-80 shrink-0 overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900">
            <div className="grid grid-cols-2 divide-x divide-slate-700/50">
                <CardImage
                    src={drawing.catUrl}
                    alt={`Reference cat ${drawing.catId}`}
                    label="reference"
                    badge={`#${rank}`}
                />
                <CardImage
                    src={drawing.imageUrl}
                    alt={`Drawing of cat ${drawing.catId}`}
                    label="drawing"
                />
            </div>
            <figcaption className="flex items-center justify-between border-t border-slate-700/50 px-3 py-2 font-mono text-[11px]">
                <span className="text-slate-500">{drawing.catId}</span>
                {drawing.score === null ? (
                    <span className="text-slate-600">unscored</span>
                ) : (
                    <span className="text-violet-300">
                        {drawing.score}
                        <span className="text-slate-600"> / 100</span>
                    </span>
                )}
            </figcaption>
        </figure>
    );
}

function CardImage({
    src,
    alt,
    label,
    badge,
}: {
    src: string;
    alt: string;
    label: string;
    badge?: string;
}) {
    return (
        <div className="relative" style={{ aspectRatio: "800 / 420" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt={alt}
                className="absolute inset-0 h-full w-full object-contain"
                loading="lazy"
            />
            {badge && (
                <span className="absolute top-1.5 left-1.5 rounded bg-slate-950/70 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                    {badge}
                </span>
            )}
            <span className="absolute bottom-1.5 left-1.5 rounded bg-slate-950/70 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
                {label}
            </span>
        </div>
    );
}
