import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Server, WatchProgress } from '@/types';

interface PlayerState {
  // Active server selection
  selectedServer: Server | null;
  lastServerName: string | null;

  // Watch progress map: episodeId → progress
  watchProgress: Record<string, WatchProgress>;

  // Actions
  setSelectedServer: (server: Server) => void;
  saveProgress: (progress: WatchProgress) => void;
  getProgress: (episodeId: string) => WatchProgress | null;
  clearProgress: (episodeId: string) => void;
  resetServer: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      selectedServer: null,
      lastServerName: null,
      watchProgress: {},

      setSelectedServer: (server) =>
        set({ selectedServer: server, lastServerName: server.name }),

      saveProgress: (progress) =>
        set((state) => ({
          watchProgress: {
            ...state.watchProgress,
            [progress.episodeId]: { ...progress, updatedAt: new Date().toISOString() },
          },
        })),

      getProgress: (episodeId) => get().watchProgress[episodeId] ?? null,

      clearProgress: (episodeId) =>
        set((state) => {
          const next = { ...state.watchProgress };
          delete next[episodeId];
          return { watchProgress: next };
        }),

      resetServer: () => set({ selectedServer: null }),
    }),
    {
      name: 'animestream-player',
      partialize: (state) => ({
        lastServerName: state.lastServerName,
        watchProgress: state.watchProgress,
      }),
    }
  )
);
