"use client";

import Image from "next/image";
import type { MiniroomItemData, MiniroomLayer } from "@/src/lib/api/admin/home/types";
import { useMiniroomCanvas } from "@/src/hooks/admin/home/use-miniroom-canvas";
import { useUploadMiniroomItem } from "@/src/hooks/admin/home/use-upload-miniroom-item";
import { useDeleteMiniroomItem } from "@/src/hooks/admin/home/use-delete-miniroom-item";
import { useSaveMiniroom } from "@/src/hooks/admin/home/use-save-miniroom";

type Props = {
    items?: MiniroomItemData[];
    ititialLayers?: MiniroomLayer[];
    backgroundUrl?: string | null;
    onDeleteItem?: (itemId: number) => Promise<void>;
    onSave?: (layers: MiniroomLayer[]) => Promise<void>;
};

export default function MiniroomEditor({
    items = [],
    ititialLayers = [],
    backgroundUrl,
    onDeleteItem,
    onSave,
}: Props) {
    const {
        canvasRef,
        layers,
        selectedId,
        selected,
        itemMap,
        handleCanvasDrop,
        handlePointerMove,
        beginMove,
        beginResize,
        stopDrag,
        selectLayer,
        clearSelection,
        removeSelected,
        removeItemFromCanvas,
    } = useMiniroomCanvas(ititialLayers, items);

    const { handleUpload } = useUploadMiniroomItem();
    const { handleDeleteItem } = useDeleteMiniroomItem({
        onDeleteItem,
        onRemoved: removeItemFromCanvas,
    });
    const { saving, handleSave } = useSaveMiniroom({ layers, onSave });

    return (
        <div className="flex h-full min-h-0 flex-col gap-3 px-6 py-4 overflow-x-auto">
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
                onPointerUp={stopDrag}
                onPointerLeave={stopDrag}
                onClick={clearSelection}
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
                                onClick={(e) => selectLayer(layer.id, e)}
                                onPointerDown={(e) => beginMove(layer, e)}
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
                                        onPointerDown={(e) => beginResize(layer, e)}
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
                    onClick={removeSelected}
                >
                    선택한 소품 캔버스에서 빼기
                </button>
            )}
        </div>
    );
}
