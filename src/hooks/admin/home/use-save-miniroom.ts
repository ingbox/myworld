"use client";

import { useCallback, useState } from "react";
import { saveMiniroom } from "@/src/lib/api/admin/home/action";
import type { MiniroomLayer } from "@/src/lib/api/admin/home/types";

type Options = {
  layers: MiniroomLayer[];
  onSave?: (layers: MiniroomLayer[]) => Promise<void>;
};

/**
 * 현재 캔버스 배치를 저장합니다.
 * 미니룸 행이 없으면 만들고, 있으면 layers만 갱신합니다.
 *
 * @param layers - 저장할 소품 좌표 (0~1 비율)
 * @param onSave - 있으면 이 함수로 저장합니다. 없으면 `saveMiniroom`
 * @returns saving - 저장 중 여부
 * @returns handleSave - 배치 저장 버튼
 */
export function useSaveMiniroom({ layers, onSave }: Options) {
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
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
  }, [layers, onSave]);

  return { saving, handleSave };
}
