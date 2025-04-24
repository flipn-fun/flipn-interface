import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useUUID = create(
    persist(
        (set, get: any) => ({
            uuids: {},
            set: (params: any) => set(() => ({ ...params })),
        }),
        {
            name: '_uuid',
            version: 0.1,
            storage: createJSONStorage(() => localStorage)
        }
    )
);