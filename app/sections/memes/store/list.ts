import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import Big from 'big.js';
import { MemePlatform, MemePlatformItem, MemePlatforms, MemeSort } from '@/app/sections/memes/config';
import { GridTableSortDirection } from '@/app/components/grid-table';

interface MemesState {
  hotListLoading: boolean;
  hotList: Hot[];
  setHotList: (list: Hot[]) => void;
  setHotListLoading: (loading: boolean) => void;
  memesListLoading: boolean;
  memesAllList: Meme[];
  memesGenesisList: Meme[];
  memesTickingList: Meme[];
  memesListedList: Meme[];
  memesImportList: Meme[];
  memesListCountdown: Record<string, number>;
  memesListHolders: Record<string, number>;
  memesListHoldersLoading: Record<string, boolean>;
  memesListPageLimit: number;
  memesListPageOffset: number;
  memesListPageNext: boolean;
  memesHoldersQueue: any[];
  setMemesAllList: (list: Meme[]) => void;
  setMemesGenesisList: (list: Meme[]) => void;
  setMemesTickingList: (list: Meme[]) => void;
  setMemesListedList: (list: Meme[]) => void;
  setMemesImportList: (list: Meme[]) => void;
  setMemesListLoading: (loading: boolean) => void;
  setMemesListPageLimit: (limit: number) => void;
  setMemesListPageOffset: (offset: number) => void;
  setMemesListPageNext: (next: boolean) => void;
  setMemesListCountdown: (obj: Record<string, number>) => void;
  setMemesListHolders: (obj: Record<string, number>) => void;
  setMemesListHoldersLoading: (obj: Record<string, boolean>) => void;
  setMemesHoldersQueue: (item: any) => void;
  spliceMemesHoldersQueue: (index: number) => void;

  memesListSortDataIndex: MemeSort;
  memesListSortDirection: GridTableSortDirection;
  memesListPlatform: MemePlatformItem;
  setMemesListSortDataIndex: (sort: MemeSort) => void;
  setMemesListSortDirection: (direction: GridTableSortDirection) => void;
  setMemesListPlatform: (platform: MemePlatformItem) => void;
  memesListSearchText: string;
  setMemesListSearchText: (searchText: string) => void;
}

export const useMemesListStore = create(persist<MemesState>((set) => ({
  hotListLoading: false,
  hotList: [],
  setHotList: (list: Hot[]) => set((state) => ({ ...state, hotList: list })),
  setHotListLoading: (loading) => set((state) => ({ ...state, hotListLoading: loading })),
  memesListLoading: false,
  memesAllList: [],
  memesGenesisList: [],
  memesTickingList: [],
  memesListedList: [],
  memesImportList: [],
  memesListPageLimit: 10,
  memesListPageOffset: 0,
  memesListPageNext: true,
  memesListCountdown: {},
  memesListHolders: {},
  memesListHoldersLoading: {},
  memesHoldersQueue: [],
  setMemesAllList: (list: Meme[]) => set((state) => ({ ...state, memesAllList: list })),
  setMemesGenesisList: (list: Meme[]) => set((state) => ({ ...state, memesGenesisList: list })),
  setMemesTickingList: (list: Meme[]) => set((state) => ({ ...state, memesTickingList: list })),
  setMemesListedList: (list: Meme[]) => set((state) => ({ ...state, memesListedList: list })),
  setMemesImportList: (list: Meme[]) => set((state) => ({ ...state, memesImportList: list })),
  setMemesListLoading: (loading) => set((state) => ({ ...state, memesListLoading: loading })),
  setMemesListPageLimit: (limit) => set((state) => ({ ...state, memesListPageLimit: limit })),
  setMemesListPageOffset: (offset) => set((state) => ({ ...state, memesListPageOffset: offset })),
  setMemesListPageNext: (next) => set((state) => ({ ...state, memesListPageNext: next })),
  setMemesListCountdown: (obj) => set((state) => {
    const _memesListCountdown = { ...state.memesListCountdown, ...obj };
    return {
      ...state,
      memesListCountdown: _memesListCountdown
    };
  }),
  setMemesListHolders: (obj) => set((state) => {
    const _memesListHolders = { ...state.memesListHolders, ...obj };
    return {
      ...state,
      memesListHolders: _memesListHolders
    };
  }),
  setMemesListHoldersLoading: (obj) => set((state) => {
    const _memesListHoldersLoading = { ...state.memesListHoldersLoading, ...obj };
    return {
      ...state,
      memesListHoldersLoading: _memesListHoldersLoading
    };
  }),
  setMemesHoldersQueue: (item) => set((state) => {
    const _memesHoldersQueue = [...state.memesHoldersQueue, item];
    return {
      ...state,
      memesHoldersQueue: _memesHoldersQueue
    };
  }),
  spliceMemesHoldersQueue: (index) => set((state) => {
    const _memesHoldersQueue = [...state.memesHoldersQueue];
    _memesHoldersQueue.splice(index, 1);
    return {
      ...state,
      memesHoldersQueue: _memesHoldersQueue
    };
  }),

  memesListSortDataIndex: MemeSort.Latest,
  memesListSortDirection: GridTableSortDirection.Asc,
  memesListPlatform: MemePlatforms[MemePlatform.Raydium],
  memesListSearchText: "",
  setMemesListSortDataIndex: (sort) => set((state) => ({ ...state, memesListSortDataIndex: sort })),
  setMemesListSortDirection: (direction) => set((state) => ({ ...state, memesListSortDirection: direction })),
  setMemesListPlatform: (platform) => set((state) => ({ ...state, memesListPlatform: platform })),
  setMemesListSearchText: (searchText) => set((state) => ({ ...state, memesListSearchText: searchText })),
}), {
  name: "_memes_list",
  version: 0.3,
  storage: createJSONStorage(() => sessionStorage),
  partialize: (state) => ({
    memesListCountdown: state.memesListCountdown,
    memesListPlatform: state.memesListPlatform,
    memesListSearchText: state.memesListSearchText,
    memesListSortDataIndex: state.memesListSortDataIndex,
    memesListSortDirection: state.memesListSortDirection,
  } as any)
}));

export interface Hot {
  id: number;
  created_at: string;
  updated_at: string;
  ranking: number;
  project_id: number;
  sol_amount: string;
  token_amount: string;
  market_cap_percentage: string;
  virtual_volume: string;
  time: number;
  project_created: string;
  project_creator: string;
  creator_name: string;
  address: string;
  like: string;
  token_decimals: number;
  token_name: string;
  token_symbol: string;
  ticker: string;
  Icon: string;
  token_supply: string;
  token_reserve: string;
  sol_reserve: string;
  market_cap: string;
  initiative_launching: boolean;
  is_king: boolean;
  last_king_time: number;
  status: number;
  video: string;
  DApp: string;
  bonding_progress: string;

  // front-end attributes
  kind: 'Hot',
  created2Now?: string;
  progress?: string;
  poolAmount?: Big.Big;
  solAmount?: Big.Big;
  marketCapTrends?: string;
  marketCapTrendsDirection?: '+' | '-';
  holder?: number;
  kLineData?: { timestamp: number; price: number; }[];
  holders?: number;
}

export interface Meme {
  id: number;
  created_at: number;
  updated_at: number;
  account: string;
  account_data: null;
  address: string;
  DApp: string;
  pool_address: string;
  token_name: string;
  token_symbol: string;
  token_decimals: number;
  token_supply: string;
  initial_sol: string;
  icon: string;
  video: string;
  ticker: string;
  about_us: string;
  website: string;
  x: string;
  tg: string;
  discord: string;
  like: number;
  un_like: number;
  super_like: number;
  pre_paid: number;
  pre_paid_amount: string;
  tx: number;
  collect: number;
  comment: number;
  is_collect: boolean;
  is_like: boolean;
  is_un_like: boolean;
  is_pre_paid: boolean;
  boost_time: number;
  status: number;
  is_show: boolean;
  concentrated_holdings: boolean;
  initiative_launching: boolean;
  launching_type: number;
  is_king: boolean;
  last_king_time: number;
  almost: string;
  volume: string;
  price: string;
  share_num: number;
  total_amount: number;
  bonding_progress: number;
  king_progress: number;
  market_cap_change: number;
  time: number;
  market_cap: number;
  countdown: number;

  // front-end attributes
  kind: 'Meme',
  created2Now?: string;
  holders?: number;
}
