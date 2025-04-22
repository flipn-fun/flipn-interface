import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware';
import { MemePhase, MemePhaseItem, MemePhases } from '@/app/sections/memes/config';

export interface MemesState {
  currentTab: MemePhaseItem;
  setCurrentTab: (tab: MemePhaseItem) => void;
}

export const useMemesStore = create(persist<MemesState>((set) => ({
  currentTab: MemePhases[MemePhase.All],
  setCurrentTab: (tab) => set((state) => ({ ...state, currentTab: tab })),
}), {
  name: '_memes_tab',
  version: 0.3,
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    currentTab: state.currentTab,
  } as any)
}));
