import { create } from 'zustand'

import type { CatDrawingData } from '@/src/lib/api/orm/types'

/**
 * 이번 세션에 업로드한 그림들. 캔버스에서 업로드하면 캐러셀이 바로 집어갈 수 있도록
 * 서버 목록과 따로 들고 있습니다.
 */
type CatDrawingStore = {
  uploaded: CatDrawingData[]
  addDrawing: (drawing: CatDrawingData) => void
}

export const selectUploaded = (state: CatDrawingStore) => state.uploaded;
export const selectAddDrawing = (state: CatDrawingStore) => state.addDrawing;

export const useCatDrawingStore = create<CatDrawingStore>((set) => ({
  uploaded: [],
  addDrawing: (drawing) =>
    set((state) => ({ uploaded: [drawing, ...state.uploaded] })),
}))
