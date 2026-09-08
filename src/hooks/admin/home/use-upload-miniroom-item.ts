"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { uploadMiniroomItem } from "@/src/lib/api/admin/home/action";

/**
 * 미니룸 창고에 소품 이미지를 올립니다.
 * 업로드가 끝나면 페이지를 새로고침해 창고 목록을 다시 받습니다.
 *
 * @returns handleUpload - `<input type="file">`의 onChange
 */
export function useUploadMiniroomItem() {
  const router = useRouter();

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      await uploadMiniroomItem({ file });
      router.refresh();
    },
    [router],
  );

  return { handleUpload };
}
