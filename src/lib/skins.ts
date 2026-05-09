import normalDefault from "@/assets/skin-normal-default.png";
import angryDefault from "@/assets/skin-angry-default.png";

export type SkinPack = {
  id: string;
  name: string;
  normalDataUrl: string;
  angryDataUrl: string;
  normalSounds?: string[];
  angrySounds?: string[];
  builtin?: boolean;
};

export type SkinMode = "single" | "multi";

const KEYS = {
  skinPacks: "angryOjisan_skinPacks",
  selectedPack: "angryOjisan_selectedSkinPack",
  skinMode: "angryOjisan_skinMode",
  adminAuth: "angryOjisan_adminAuth",
  builtinDeleted: "angryOjisan_builtinDeleted",
  defaultPackId: "angryOjisan_defaultPackId",
};

export const ADMIN_PASSWORD = "123456";

const BUILTIN_ID = "builtin-default";

const BASE_BUILTIN: SkinPack = {
  id: BUILTIN_ID,
  name: "Default",
  normalDataUrl: normalDefault,
  angryDataUrl: angryDefault,
  normalSounds: [],
  angrySounds: [],
};

const isBuiltinDeleted = () =>
  localStorage.getItem(KEYS.builtinDeleted) === "1";

const setBuiltinDeleted = (v: boolean) => {
  if (v) localStorage.setItem(KEYS.builtinDeleted, "1");
  else localStorage.removeItem(KEYS.builtinDeleted);
};

const getDefaultPackId = (): string =>
  localStorage.getItem(KEYS.defaultPackId) || BUILTIN_ID;

const setDefaultPackId = (id: string) =>
  localStorage.setItem(KEYS.defaultPackId, id);

// Backwards-compat export (kept so other imports don't break).
export const BUILTIN_PACK: SkinPack = { ...BASE_BUILTIN, builtin: true };

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

const decorate = (pack: SkinPack, defaultId: string): SkinPack => ({
  ...pack,
  builtin: pack.id === defaultId,
});

export const getSkinPacks = (): SkinPack[] => {
  const custom = readPacks();
  const defaultId = getDefaultPackId();
  const list: SkinPack[] = [];
  if (!isBuiltinDeleted()) list.push(BASE_BUILTIN);
  list.push(...custom);
  // If the stored default id no longer exists, fall back to first available.
  const exists = list.some((p) => p.id === defaultId);
  const effectiveDefault = exists ? defaultId : list[0]?.id ?? BUILTIN_ID;
  if (!exists && list.length > 0) setDefaultPackId(effectiveDefault);
  return list.map((p) => decorate(p, effectiveDefault));
};

export const addSkinPack = (pack: SkinPack) => {
  const clean = { ...pack };
  delete clean.builtin;
  writePacks([...readPacks(), clean]);
};

export const updateSkinPack = (updated: SkinPack) => {
  if (updated.id === BUILTIN_ID) return; // builtin asset is immutable
  const packs = readPacks();
  const idx = packs.findIndex((p) => p.id === updated.id);
  if (idx >= 0) {
    const clean = { ...updated };
    delete clean.builtin;
    packs[idx] = clean;
    writePacks(packs);
  }
};

export const removeSkinPack = (id: string): boolean => {
  const all = getSkinPacks();
  if (all.length <= 1) return false;

  const wasDefault = id === getDefaultPackId();

  // Remove the pack
  if (id === BUILTIN_ID) {
    setBuiltinDeleted(true);
  } else {
    writePacks(readPacks().filter((p) => p.id !== id));
  }

  // If we removed the default, randomly promote one of the remaining packs.
  if (wasDefault) {
    const remaining = getSkinPacks(); // recompute
    if (remaining.length > 0) {
      const pick = remaining[Math.floor(Math.random() * remaining.length)];
      setDefaultPackId(pick.id);
    }
  }

  if (getSelectedPackId() === id) {
    const remaining = getSkinPacks();
    setSelectedPackId(remaining[0]?.id || BUILTIN_ID);
  }
  return true;
};

export const canDeletePack = (): boolean => getSkinPacks().length > 1;

export const getSelectedPackId = () =>
  localStorage.getItem(KEYS.selectedPack) || getDefaultPackId();

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
