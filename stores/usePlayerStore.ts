import { create } from 'zustand'

/** 주크박스 DB 곡 정보 */
export type TrackSource = {
  id: string
  title: string
  artist: string
  download_url: string
}

/** 재생 큐에 올라간 항목 — 추가할 때마다 queueId 부여 */
export type Track = TrackSource & {
  queueId: string
}

type PlayerStore = {
  queue: Track[]
  currentIndex: number
  addToQueue: (tracks: TrackSource[]) => void
  removeFromQueue: (queueId: string) => void
  clearQueue: () => void
  playNext: () => void
  playPrev: () => void
  setCurrentIndex: (index: number) => void
}

function createQueueId() {
  return crypto.randomUUID()
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  queue: [],
  currentIndex: 0,
  addToQueue: (tracks) =>
    set((state) => ({
      queue: [
        ...state.queue,
        ...tracks.map((track) => ({
          ...track,
          queueId: createQueueId(),
        })),
      ],
    })),
  removeFromQueue: (queueId) =>
    set((state) => {
      const removeIndex = state.queue.findIndex((track) => track.queueId === queueId)
      if (removeIndex === -1) return state

      const queue = state.queue.filter((track) => track.queueId !== queueId)
      let currentIndex = state.currentIndex

      if (removeIndex < state.currentIndex) {
        currentIndex = state.currentIndex - 1
      } else if (removeIndex === state.currentIndex) {
        currentIndex = Math.min(state.currentIndex, queue.length - 1)
      }

      return {
        queue,
        currentIndex: queue.length === 0 ? 0 : Math.max(0, currentIndex),
      }
    }),
  clearQueue: () => set({ queue: [], currentIndex: 0 }),
  playNext: () =>
    set((state) => ({
      currentIndex:
        state.currentIndex < state.queue.length - 1
          ? state.currentIndex + 1
          : state.currentIndex,
    })),
  playPrev: () =>
    set((state) => ({
      currentIndex:
        state.currentIndex > 0
          ? state.currentIndex - 1
          : 0,
    })),
  setCurrentIndex: (index) => set({ currentIndex: index }),
}))
