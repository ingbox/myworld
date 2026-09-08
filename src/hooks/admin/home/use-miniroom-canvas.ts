"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type {
  MiniroomItemData,
  MiniroomLayer,
} from "@/src/lib/api/admin/home/types";

/**
 * 지금 포인터로 하고 있는 작업.
 * move는 잡은 점과 레이어 원점의 간격(offset)을 유지하고,
 * resize는 레이어 왼쪽 위(startX/startY)를 고정한 채 크기만 바꿉니다.
 */
type DragState =
  | { type: "move"; layerId: string; offsetX: number; offsetY: number }
  | {
      type: "resize";
      layerId: string;
      startX: number;
      startY: number;
      startW: number;
      startH: number;
    }
  | null;

/**
 * 값을 min~max 안으로 자릅니다. 캔버스 밖으로 나가지 않게 할 때 씁니다.
 *
 * @param n - 자를 값
 * @param min - 하한
 * @param max - 상한
 * @returns min 이상 max 이하인 값
 */
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * 캔버스 레이어 id를 만듭니다. 같은 소품을 여러 개 올려도 구분되게 합니다.
 *
 * @returns `시각-난수` 형태의 문자열 id
 */
function newLayerId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 미니룸 캔버스의 소품 배치를 다룹니다.
 * 드롭으로 올리고, 끌어 옮기고, 모서리로 크기를 조절합니다. 좌표는 0~1 비율입니다.
 *
 * @param initialLayers - 저장된 배치. 없으면 빈 캔버스
 * @param items - 창고 아이템. 레이어의 item_id로 이미지를 찾습니다
 * @returns 캔버스 ref, 레이어 상태, 드롭/드래그/선택 핸들러
 */
export function useMiniroomCanvas(
  initialLayers: MiniroomLayer[] = [],
  items: MiniroomItemData[] = [],
) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState<MiniroomLayer[]>(initialLayers);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState>(null);

  const itemMap = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );

  const selected = layers.find((layer) => layer.id === selectedId) ?? null;

  /**
   * 캔버스의 현재 픽셀 크기를 읽습니다.
   * 아직 측정 전이면 에디터 기본값 616×300을 씁니다.
   *
   * @returns `{ width, height }` 픽셀
   */
  const getCanvasSize = useCallback(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return {
      width: rect?.width ?? 616,
      height: rect?.height ?? 300,
    };
  }, []);

  /**
   * 드롭 위치에 소품을 하나 올립니다.
   * 가로는 캔버스 너비의 18%, 세로는 원본 비율(`가로/세로`)에 맞춥니다.
   * `h = (w * cw) / aspect / ch` — 가로 픽셀을 비율로 세로를 구한 뒤 높이 비율로 바꿉니다.
   * 세로는 8%~50%로 제한하고, 상자는 커서 중심에 오며 캔버스 안에만 둡니다.
   *
   * @param item - 창고 아이템
   * @param clientX - 드롭한 마우스 x (viewport)
   * @param clientY - 드롭한 마우스 y (viewport)
   */
  const addItemAt = useCallback(
    (item: MiniroomItemData, clientX: number, clientY: number) => {
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

      const nextId = newLayerId();
      setLayers((prev) => [
        ...prev,
        {
          id: nextId,
          item_id: item.id,
          x,
          y,
          w,
          h,
          z: (prev.at(-1)?.z ?? 0) + 1,
        },
      ]);
      setSelectedId(nextId);
    },
    [getCanvasSize],
  );

  /**
   * 창고에서 캔버스로 드롭했을 때 호출합니다.
   * `miniroom-item` JSON을 읽어 `addItemAt`으로 올립니다.
   *
   * @param e - 캔버스 drop 이벤트
   */
  const handleCanvasDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("miniroom-item");
      if (!raw) return;
      const item = JSON.parse(raw) as MiniroomItemData;
      addItemAt(item, e.clientX, e.clientY);
    },
    [addItemAt],
  );

  /**
   * 포인터를 움직이는 동안 선택 레이어를 갱신합니다.
   * move면 잡은 지점 오프셋을 유지한 채 x/y를 바꾸고,
   * resize면 왼쪽 위는 고정하고 커서까지를 w/h로 씁니다.
   *
   * @param e - 캔버스 pointermove 이벤트
   */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
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
    },
    [drag, getCanvasSize],
  );

  /**
   * 소품을 잡아서 이동을 시작합니다.
   * 커서와 레이어 왼쪽 위 사이 간격을 offset으로 저장해, 드래그 중 점프하지 않게 합니다.
   *
   * @param layer - 움직이려는 레이어
   * @param e - 레이어 pointerdown 이벤트
   */
  const beginMove = useCallback(
    (layer: MiniroomLayer, e: React.PointerEvent<HTMLDivElement>) => {
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
    },
    [getCanvasSize],
  );

  /**
   * 오른쪽 아래 핸들로 크기 조절을 시작합니다.
   * 레이어의 현재 x/y를 기준으로, 이후 커서 위치가 새 w/h가 됩니다.
   *
   * @param layer - 크기를 바꿀 레이어
   * @param e - 리사이즈 핸들 pointerdown 이벤트
   */
  const beginResize = useCallback(
    (layer: MiniroomLayer, e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      setDrag({
        type: "resize",
        layerId: layer.id,
        startX: layer.x,
        startY: layer.y,
        startW: layer.w,
        startH: layer.h,
      });
    },
    [],
  );

  /**
   * 이동/리사이즈를 끝냅니다. pointerup·pointerleave에서 호출합니다.
   */
  const stopDrag = useCallback(() => setDrag(null), []);

  /**
   * 소품을 선택합니다. 캔버스 빈 곳 클릭과 구분하려고 버블을 막습니다.
   *
   * @param layerId - 선택할 레이어 id
   * @param e - 레이어 click 이벤트. 있으면 stopPropagation
   */
  const selectLayer = useCallback((layerId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedId(layerId);
  }, []);

  /**
   * 선택을 해제합니다. 캔버스 빈 곳을 클릭했을 때 씁니다.
   */
  const clearSelection = useCallback(() => setSelectedId(null), []);

  /**
   * 선택된 소품만 캔버스에서 뺍니다. 창고 아이템은 그대로입니다.
   */
  const removeSelected = useCallback(() => {
    if (!selectedId) return;
    setLayers((prev) => prev.filter((layer) => layer.id !== selectedId));
    setSelectedId(null);
  }, [selectedId]);

  /**
   * 창고에서 지운 아이템이 캔버스에 올라가 있으면 같이 뺍니다.
   * 그 아이템이 선택 중이면 선택도 해제합니다.
   *
   * @param itemId - 삭제한 창고 아이템 id
   */
  const removeItemFromCanvas = useCallback((itemId: number) => {
    setLayers((prev) => prev.filter((layer) => layer.item_id !== itemId));
    setSelectedId((current) => {
      if (!current) return current;
      const selectedLayer = layers.find((layer) => layer.id === current);
      return selectedLayer?.item_id === itemId ? null : current;
    });
  }, [layers]);

  return {
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
  };
}
