export const UN_REDIRECT_PATH = [
  /^\/invite-code$/,
  /^\/ref$/,
  /^\/backpack$/,
];

export enum INVITE_TYPE {
  INVITE_CODE = "invite-code",
  REF = "ref",
  BACKPACK = "backpack",
}

export const INVITERS: Record<string, { name: string; logo: string; code: string; }> = {
  backpack: {
    name: "Backpack 🎒",
    logo: "/img/invite-code/logo-backpack.jpg",
    code: "backpack"
  },
};
