import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware';

interface SmokeHotState {
  panelShow: boolean;
  vipShow: boolean;
  flipNum: number;
  setPanelShow: (visible: boolean) => void;
  setVipShow: (visible: boolean) => void;
  setFlipNum: (num: number) => void;
}

export const useSmokeHotStore = create(persist<SmokeHotState>((set) => ({
  panelShow: false,
  vipShow: false,
  flipNum: 0,
  setPanelShow: (visible) => set((state) => ({ ...state, panelShow: visible })),
  setVipShow: (visible) => set((state) => ({ ...state, vipShow: visible })),
  setFlipNum: (num) => set((state) => ({ ...state, flipNum: num })),
}), {
  name: '_smoke_hot',
  version: 0.1,
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({} as any)
}));
