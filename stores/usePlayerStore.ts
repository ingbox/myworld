import { create } from 'zustand'

export type Track = {
  id: string
  title: string
  artist: string
  url: string
}

type PlayerStore = {
  queue: Track[]
  currentIndex: number
  addToQueue: (tracks: Track[]) => void
  removeFromQueue: (id: string) => void
  clearQueue: () => void
  playNext: () => void
  playPrev: () => void
  setCurrentIndex: (index: number) => void
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  queue: [],
  currentIndex: 0,
  addToQueue: (tracks) =>
    set((state) => ({
      queue: [...state.queue, ...tracks],
    })),
  removeFromQueue: (id) =>
    set((state) => ({
      queue: state.queue.filter((track) => track.id !== id),
    })),
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