"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { deleteMiniroomItem } from "@/src/lib/api/admin/home/action";

type Options = {
  onDeleteItem?: (itemId: number) => Promise<void>;
  onRemoved?: (itemId: number) => void;
};

/**
 * 창고 아이템을 소프트 삭제합니다.
 * DB에서 뺀 뒤 캔버스에 올라가 있던 같은 소품도 `onRemoved`로 지웁니다.
 *
 * @param onDeleteItem - 있으면 이 함수로 삭제합니다. 없으면 `deleteMiniroomItem`
 * @param onRemoved - 삭제된 item_id. 캔버스 layers에서 제거할 때 씁니다
 * @returns handleDeleteItem - 창고 썸네일 삭제 버튼
 */
export function useDeleteMiniroomItem({
  onDeleteItem,
  onRemoved,
}: Options = {}) {
  const router = useRouter();

  const handleDeleteItem = useCallback(
    async (itemId: number) => {
      if (onDeleteItem) {
        await onDeleteItem(itemId);
      } else {
        await deleteMiniroomItem(itemId);
      }
      onRemoved?.(itemId);
      router.refresh();
    },
    [onDeleteItem, onRemoved, router],
  );

  return { handleDeleteItem };
}
