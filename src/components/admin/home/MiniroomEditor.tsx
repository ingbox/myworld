"use client";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { deleteMiniroomItem, saveMiniroom, uploadMiniroomItem } from "@/src/lib/api/admin/home/action";
import { useRouter } from "next/navigation";

export type MiniroomItem = {
    id: number;
    name: string | null;
    url: string;
    width: number | null;
    height: number | null;
}

export type MiniroomLayer = {
    id: string;
    item_id: number;
    x: number;
    y: number;
    w: number;
    h: number;
    z: number;
}

type Props = {
    items?: MiniroomItem[];
    ititialLayers?: MiniroomLayer[];
    backgroundUrl?: string | null;
    onDeleteItem?: (itemId: number) => Promise<void>;
    onSave?: (layers: MiniroomLayer[]) => Promise<void>;
}

type DragState =
    | { type: "move"; layerId: string; offsetX: number; offsetY: number }
    | { type: "resize"; layerId: string; startX: number; startY: number; startW: number; startH: number }
    | null;

function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}

function newLayerId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function MiniroomEditor({
    items = [],
    ititialLayers = [],
    backgroundUrl,
    onDeleteItem,
    onSave,
}: Props) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [layers, setLayers] = useState<MiniroomLayer[]>(ititialLayers);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [drag, setDrag] = useState<DragState>(null);
    const [saving, setSaving] = useState(false);

    const itemMap = useMemo(
        () => new Map(items.map(item => [item.id, item])),
        [items],
    );

    const getCanvasSize = () => {
        const rect = canvasRef.current?.getBoundingClientRect();
        return {
            width: rect?.width ?? 616,
            height: rect?.height ?? 300,
        };
    };

    const addItemAt = (item: MiniroomItem, clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const { width: cw, height: ch } = getCanvasSize();
        const aspect =
            item.width && item.height ? item.width / item.height : 1;
        const w = 0.18;
        const h = clamp((w * cw) / aspect / ch, 0.08, 0.5);
        const x = clamp((clientX - rect.left) / cw - w / 2, 0, 1 - w);
        const y = clamp((clientY - rect.top) / ch - h / 2, 0, 1 - h);
        const z = (layers.at(-1)?.z ?? 0) + 1;

        const next: MiniroomLayer = {
            id: newLayerId(),
            item_id: item.id,
            x,
            y,
            w,
            h,
            z,
        };
        setLayers(prev => [...prev, next]);
        setSelectedId(next.id);
    };

    const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData("miniroom-item");
        if (!raw) return;
        const item = JSON.parse(raw) as MiniroomItem;
        addItemAt(item, e.clientX, e.clientY);
    };


    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!drag) return;
        const { width: cw, height: ch } = getCanvasSize();
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const px = (e.clientX - rect.left) / cw;
        const py = (e.clientY - rect.top) / ch;
        setLayers((prev) =>
            prev.map((layer) => {
                if (layer.id !== drag.layerId) return layer;
                if (drag.type === "move") {
                    const x = clamp(px - drag.offsetX, 0, 1 - layer.w);
                    const y = clamp(py - drag.offsetY, 0, 1 - layer.h);
                    return { ...layer, x, y };
                }
                const w = clamp(px - drag.startX, 0.05, 1 - layer.x);
                const h = clamp(py - drag.startY, 0.05, 1 - layer.y);
                return { ...layer, w, h };
            }),
        );
    };

    const router = useRouter();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        await uploadMiniroomItem({ file });
        router.refresh();
    };

    const handleDeleteItem = async (itemId: number) => {
        if (onDeleteItem) {
            await onDeleteItem(itemId);
        } else {
            await deleteMiniroomItem(itemId);
        }
        setLayers((prev) => prev.filter((layer) => layer.item_id !== itemId));
        setSelectedId((prev) => {
            const selectedLayer = layers.find((layer) => layer.id === prev);
            return selectedLayer?.item_id === itemId ? null : prev;
        });
        router.refresh();
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (onSave) {
                await onSave(layers);
            } else {
                await saveMiniroom(layers);
            }
        } finally {
            setSaving(false);
        }
    };

    const selected = layers.find((layer) => layer.id === selectedId);


    return (
        <div className="flex h-full min-h-0 flex-col gap-3 px-6 py-4">
            <div className="flex w-154 items-center justify-between">
                <p className="text-sm font-semibold text-[#459ebe]">Mini Room</p>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="h-8 rounded bg-[#459ebe] px-4 text-sm text-white disabled:opacity-40"
                >
                    {saving ? "저장 중..." : "배치 저장"}
                </button>
            </div>

            <div
                ref={canvasRef}
                className="relative h-75 w-154 shrink-0 overflow-hidden border border-gray-300 bg-[#f4f4f2]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleCanvasDrop}
                onPointerMove={handlePointerMove}
                onPointerUp={() => setDrag(null)}
                onPointerLeave={() => setDrag(null)}
                onClick={() => setSelectedId(null)}
            >
                {(backgroundUrl || layers.length === 0) && (
                    <img
                        src={backgroundUrl || "/images/cy/home/miniroom.png"}
                        alt=""
                        draggable={false}
                        className="pointer-events-none absolute inset-0 h-full w-full object-fill select-none"
                    />
                )}
                {layers
                    .slice()
                    .sort((a, b) => a.z - b.z)
                    .map((layer) => {
                        const item = itemMap.get(layer.item_id);
                        if (!item) return null;
                        const isSelected = layer.id === selectedId;

                        return (
                            <div
                                key={layer.id}
                                className={`absolute cursor-move ${isSelected ? "ring-1 ring-[#459ebe]" : ""}`}
                                style={{
                                    left: `${layer.x * 100}%`,
                                    top: `${layer.y * 100}%`,
                                    width: `${layer.w * 100}%`,
                                    height: `${layer.h * 100}%`,
                                    zIndex: layer.z,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedId(layer.id);
                                }}
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    setSelectedId(layer.id);
                                    const rect = canvasRef.current?.getBoundingClientRect();
                                    if (!rect) return;
                                    const { width: cw, height: ch } = getCanvasSize();
                                    const px = (e.clientX - rect.left) / cw;
                                    const py = (e.clientY - rect.top) / ch;
                                    setDrag({
                                        type: "move",
                                        layerId: layer.id,
                                        offsetX: px - layer.x,
                                        offsetY: py - layer.y,
                                    });
                                }}
                            >
                                <img
                                    src={item.url}
                                    alt={item.name ?? ""}
                                    draggable={false}
                                    className="pointer-events-none h-full w-full select-none object-contain"
                                />
                                {isSelected && (
                                    <div
                                        className="absolute right-0 bottom-0 h-3 w-3 cursor-se-resize bg-[#459ebe]"
                                        onPointerDown={(e) => {
                                            e.stopPropagation();
                                            setDrag({
                                                type: "resize",
                                                layerId: layer.id,
                                                startX: layer.x,
                                                startY: layer.y,
                                                startW: layer.w,
                                                startH: layer.h,
                                            });
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
            </div>

            <aside className="flex w-154 shrink-0 flex-col rounded border border-gray-300 bg-white p-2">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">아이템</span>
                    <label className="cursor-pointer text-xs text-[#459ebe]">
                        업로드
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/gif,image/webp"
                            className="hidden"
                            onChange={handleUpload}
                        />
                    </label>
                </div>
                <div className="grid max-h-40 grid-cols-6 gap-2 overflow-auto">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="relative h-16 rounded border border-gray-200 p-1"
                        >
                            <Image
                                src={item.url}
                                alt={item.name ?? ""}
                                fill
                                sizes="80px"
                                className="cursor-grab object-contain"
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData(
                                        "miniroom-item",
                                        JSON.stringify(item),
                                    );
                                }}
                            />
                            <button
                                type="button"
                                className="absolute top-0.5 right-0.5 z-10 flex h-4 w-4 items-center justify-center rounded bg-white/90 text-[10px] leading-none text-gray-500 hover:bg-red-500 hover:text-white"
                                aria-label="아이템 삭제"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    void handleDeleteItem(item.id);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <p className="col-span-6 py-6 text-center text-xs text-gray-400">
                            이미지를 업로드하세요
                        </p>
                    )}
                </div>
            </aside>

            {selected && (
                <button
                    type="button"
                    className="self-start text-xs text-red-500"
                    onClick={() => {
                        setLayers((prev) => prev.filter((layer) => layer.id !== selected.id));
                        setSelectedId(null);
                    }}
                >
                    선택한 소품 캔버스에서 빼기
                </button>
            )}
        </div>
    );
}