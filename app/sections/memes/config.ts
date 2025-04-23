export interface Filter {
  value: string;
  label: string;
  order: Order;
}

export interface Tab {
  value: string;
  label: string;
  filters?: Filter[];
  icon?: string;
  iconSize?: number;
}

export enum Order {
  Asc = "asc",
  Desc = "desc"
}

export enum MemePlatform {
  Raydium = "Raydium",
  Meteora = "Meteora",
  FlipN = "sexy",
}

export interface MemePlatformItem {
  value: MemePlatform;
  label: string;
  icon: string;
  // used for back-end params
  dApp: string[];
}

export const MemePlatforms: Record<MemePlatform, MemePlatformItem> = {
  [MemePlatform.Raydium]: {
    value: MemePlatform.Raydium,
    label: "Raydium",
    icon: "/img/memes/icon-raydium.svg",
    dApp: ["ray_launchpad"],
  },
  [MemePlatform.Meteora]: {
    value: MemePlatform.Meteora,
    label: "Meteora",
    icon: "/img/memes/icon-meteora.svg",
    dApp: ["ray_launchpad"],
  },
  [MemePlatform.FlipN]: {
    value: MemePlatform.FlipN,
    label: "FlipN",
    icon: "/img/memes/icon-flipn.svg",
    dApp: ["ray_launchpad"],
  },
};

export enum MemePhase {
  All = "All",
  New = "New",
  Bonding = "Bonding",
  Listed = "Listed",
}

export enum MemePhaseType {
  All = "all",
  New = "genesis",
  Bonding = "ticking",
  Listed = "listed",
}

export interface MemePhaseItem {
  value: MemePhase;
  label: string;
  status: number | "";
  type: MemePhaseType;
}

export const MemePhases: Record<MemePhase, MemePhaseItem> = {
  [MemePhase.All]: {
    value: MemePhase.All,
    label: "All",
    status: "",
    type: MemePhaseType.All,
  },
  [MemePhase.New]: {
    value: MemePhase.New,
    label: "New",
    status: 0,
    type: MemePhaseType.New,
  },
  [MemePhase.Bonding]: {
    value: MemePhase.Bonding,
    label: "Bonding",
    status: 1,
    type: MemePhaseType.Bonding,
  },
  [MemePhase.Listed]: {
    value: MemePhase.Listed,
    label: "Listed",
    status: 3,
    type: MemePhaseType.Listed,
  },
};

export enum MemeSort {
  MC = "mcap",
  Almost = "almost",
  Volume = "volume",
  Age = "latest",
  Likes = "likes",
  Flips = "flips",
  Import = "import",
  Liq = "liq",
  Holders = "holders",
}

export type MemeSortOptionTypes = MemeSort.Age | MemeSort.MC | MemeSort.Volume;

export interface MemeSortOption {
  value: MemeSortOptionTypes;
  label: string;
}

export const MemeSortOptions: Record<MemeSortOptionTypes, MemeSortOption> = {
  [MemeSort.Age]: {
    value: MemeSort.Age,
    label: "Age",
  },
  // [MemeSort.Liq]: {
  //   value: MemeSort.Liq,
  //   label: "Liq",
  // },
  [MemeSort.Volume]: {
    value: MemeSort.Volume,
    label: "Vol",
  },
  [MemeSort.MC]: {
    value: MemeSort.MC,
    label: "MCap",
  },
  // [MemeSort.Holders]: {
  //   value: MemeSort.Holders,
  //   label: "Holders",
  // },
};
