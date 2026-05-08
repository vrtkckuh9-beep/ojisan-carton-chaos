import normalDefault from "@/assets/skin-normal-default.png";
import angryDefault from "@/assets/skin-angry-default.png";

export type SkinPack = {
  id: string;
  name: string;
  normalDataUrl: string;
  angryDataUrl: string;
  builtin?: boolean;
};

export type SkinMode = "single" | "multi";

const KEYS = {
  skinPacks: "angryOjisan_skinPacks",
  selectedPack: "angryOjisan_selectedSkinPack",
  skinMode: "angryOjisan_skinMode",
  adminAuth: "angryOjisan_adminAuth",
};

export const ADMIN_PASSWORD = "123456";

export const BUILTIN_PACK: SkinPack = {
  id: "builtin-default",
  name: "Default",
  normalDataUrl: normalDefault,
  angryDataUrl: angryDefault,
  builtin: true,
};

const readPacks = (): SkinPack[] => {
  try {
    const raw = localStorage.getItem(KEYS.skinPacks);
    return raw ? (JSON.parse(raw) as SkinPack[]) : [];
  } catch {
    return [];
  }
};

const writePacks = (packs: SkinPack[]) => {
  localStorage.setItem(KEYS.skinPacks, JSON.stringify(packs));
};

export const getSkinPacks = (): SkinPack[] => [BUILTIN_PACK, ...readPacks()];

export const addSkinPack = (pack: SkinPack) => writePacks([...readPacks(), pack]);

export const removeSkinPack = (id: string): boolean => {
  const all = getSkinPacks();
  if (all.length <= 1) return false;
  writePacks(readPacks().filter((p) => p.id !== id));
  if (getSelectedPackId() === id) {
    setSelectedPackId(BUILTIN_PACK.id);
  }
  return true;
};

export const canDeletePack = (): boolean => getSkinPacks().length > 1;

export const getSelectedPackId = () =>
  localStorage.getItem(KEYS.selectedPack) || BUILTIN_PACK.id;

export const setSelectedPackId = (id: string) =>
  localStorage.setItem(KEYS.selectedPack, id);

export const getSelectedPack = (): SkinPack => {
  const packs = getSkinPacks();
  const selId = getSelectedPackId();
  return packs.find((p) => p.id === selId) || packs[0];
};

export const findPack = (packs: SkinPack[], id: string): SkinPack =>
  packs.find((p) => p.id === id) || packs[0];

export const getSkinMode = (): SkinMode =>
  (localStorage.getItem(KEYS.skinMode) as SkinMode) || "single";

export const setSkinMode = (mode: SkinMode) =>
  localStorage.setItem(KEYS.skinMode, mode);

export const isAdmin = () => localStorage.getItem(KEYS.adminAuth) === "1";
export const setAdmin = (v: boolean) => {
  if (v) localStorage.setItem(KEYS.adminAuth, "1");
  else localStorage.removeItem(KEYS.adminAuth);
};

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
