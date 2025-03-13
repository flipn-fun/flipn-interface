import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { RPCS } from "../config/rpc";

export const useSetting = create(
  persist(
    (set, get: any) => ({
      menuExpand: true,
      autoPlay: false,
      flipMax: 1,
      jitoable: false,
      showRpcErrorModal: false,
      showRpcSelectModal: false,
      rpc: RPCS[2],
      set: (params: any) => set(() => ({ ...params }))
    }),
    {
      name: "_user_setting",
      version: 0.1,
      storage: createJSONStorage(() => localStorage)
    }
  )
);
