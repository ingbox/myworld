import type { MiniroomItemData, MiniroomLayer } from "@/src/lib/api/admin/home/types";

const DEFAULT_BACKGROUND = "/images/cy/home/miniroom.png";

type Props = {
    layers?: MiniroomLayer[];
    items?: MiniroomItemData[];
    backgroundUrl?: string | null;
};

export default function Miniroom({
    layers = [],
    items = [],
    backgroundUrl,
}: Props) {
    const itemMap = new Map(items.map((item) => [item.id, item]));
    const hasPlacement = layers.length > 0;
    const background = backgroundUrl || (hasPlacement ? null : DEFAULT_BACKGROUND);

    return (
        <div className="relative w-full max-w-154 aspect-616/300 overflow-hidden bg-[#f4f4f2]">
            {background && (
                <img
                    src={background}
                    alt=""
                    className="absolute inset-0 h-full w-full object-fill"
                />
            )}
            {layers
                .slice()
                .sort((a, b) => a.z - b.z)
                .map((layer) => {
                    const item = itemMap.get(layer.item_id);
                    if (!item) return null;

                    return (
                        <div
                            key={layer.id}
                            className="absolute"
                            style={{
                                left: `${layer.x * 100}%`,
                                top: `${layer.y * 100}%`,
                                width: `${layer.w * 100}%`,
                                height: `${layer.h * 100}%`,
                                zIndex: layer.z,
                            }}
                        >
                            <img
                                src={item.url}
                                alt={item.name ?? ""}
                                className="h-full w-full object-contain"
                            />
                        </div>
                    );
                })}
        </div>
    );
}
