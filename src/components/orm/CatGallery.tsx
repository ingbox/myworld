'use client';

import { getCatList } from "@/src/lib/api/orm/service";
import { useState } from "react";

interface CatImage {
    id: string;
    url: string;
    breeds?: { name: string; id: string }[];
}

interface Breed {
    name: string;
    id: string;
}

export default function CatGallery({ initialCats, initialTotal }: { initialCats: CatImage[], initialTotal: number }) {
   
    const [totalCount, setTotalCount] = useState<number>(initialTotal);
    const [cats, setCats] = useState<CatImage[]>(initialCats);
    const [breeds, setBreeds] = useState<Breed[]>([]);
    const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null);
    const [search, setSearch] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const hasMore = cats.length < totalCount;

    async function loadMore() {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const result = await getCatList(cats.map((cat) => cat.id));
            setCats((prev) => {
                const ids = new Set(prev.map((c) => c.id));
                return [...prev, ...result.cats.filter((c) => !ids.has(c.id))];
              });
            setTotalCount(result.totalCount);
        } finally {
            setLoading(false);
        }
    }

    return (

        <section id="get" className="mb-16 px-8 mx-auto">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    GET
                </span>
                <h2 className="text-2xl font-semibold text-slate-100">/cats/images</h2>
            </div>

            {/* Request builder */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-6 font-mono text-sm">
                <div className="text-slate-500 text-xs mb-3 uppercase tracking-wider">Request</div>
                <div className="text-slate-300">
                    <span className="text-emerald-400 font-semibold">prisma</span>
                    <span className="text-slate-500">.cat.</span>
                    <span className="text-sky-400">findMany</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                    take=<span className="text-amber-400">10</span>
                    {" "}orderBy=<span className="text-emerald-400">random</span>
                    {" "}exclude=<span className="text-amber-400">{cats.length}</span>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by breed name..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
            </div>

            {/* Breed tags */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setSelectedBreed(null)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedBreed === null
                        ? "bg-violet-600 text-white"
                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-violet-500/50"
                        }`}
                >
                    🐱 All
                </button>
                {breeds.map((b) => (
                    <button
                        key={b.id}
                        onClick={() => setSelectedBreed(b.id === selectedBreed?.id ? null : b)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedBreed?.id === b.id
                            ? "bg-violet-600 text-white"
                            : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-violet-500/50"
                            }`}
                    >
                        {b.name}
                    </button>
                ))}
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800/80">
                    <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-emerald-400 font-semibold">200 OK</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">{cats.length} images</span>
                    </div>
                    <span className="text-slate-500 text-xs font-mono">application/json</span>
                </div>
                {loading ? (
                    <div className="grid grid-cols-3 gap-3 p-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="aspect-[4/3] bg-slate-700/50 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : cats.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 font-mono text-sm">
                        🐱 No cats found. Try a different breed or search term.
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-3 p-4">
                        {cats.map((cat) => (
                            <div key={cat.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-700">
                                <img
                                    src={cat.url}
                                    alt={cat.breeds?.[0]?.name ?? "Cat"}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                                {cat.breeds?.[0] && (
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-medium">{cat.breeds[0].name}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {!loading && hasMore && (
                    <div className="px-4 pb-4">
                        <button
                            onClick={loadMore}
                            className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-slate-500 text-xs font-mono hover:border-violet-500/50 hover:text-violet-400 transition-colors"
                        >
                            + Load more
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}