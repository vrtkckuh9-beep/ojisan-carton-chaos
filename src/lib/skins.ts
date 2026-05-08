import normalDefault from "@/assets/skin-normal-default.png";
import angryDefault from "@/assets/skin-angry-default.png";

export type Skin = {
  id: string;
  name: string;
  dataUrl: string; // imported asset URL or base64 data URL
  builtin?: boolean;
};

export type SkinPack = {
  id: string;
  name: string;
  normalDataUrl: string;
  angryDataUrl: string;
  builtin?: boolean;
};

const KEYS = {
  libNormal: "angryOjisan_skinLibrary_normal",
  libAngry: "angryOjisan_skinLibrary_angry",
  defNormal: "angryOjisan_defaultNormalSkin",
  defAngry: "angryOjisan_defaultAngrySkin",
  selNormal: "angryOjisan_selectedNormalSkin",
  selAngry: "angryOjisan_selectedAngrySkin",
  adminAuth: "angryOjisan_adminAuth",
  packs: "angryOjisan_skinPacks",
  defPack: "angryOjisan_defaultSkinPack",
  selPack: "angryOjisan_selectedSkinPack",
};

export const ADMIN_PASSWORD = "ojisan2026";

export const BUILTIN_NORMAL: Skin = {
  id: "builtin-normal",
  name: "Default",
  dataUrl: normalDefault,
  builtin: true,
};
export const BUILTIN_ANGRY: Skin = {
  id: "builtin-angry",
  name: "Default",
  dataUrl: angryDefault,
  builtin: true,
};

const read = (key: string): Skin[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Skin[]) : [];
  } catch {
    return [];
  }
};

const write = (key: string, skins: Skin[]) => {
  localStorage.setItem(key, JSON.stringify(skins));
};

export const getNormalLibrary = (): Skin[] => [BUILTIN_NORMAL, ...read(KEYS.libNormal)];
export const getAngryLibrary = (): Skin[] => [BUILTIN_ANGRY, ...read(KEYS.libAngry)];

export const addNormalSkin = (s: Skin) => write(KEYS.libNormal, [...read(KEYS.libNormal), s]);
export const addAngrySkin = (s: Skin) => write(KEYS.libAngry, [...read(KEYS.libAngry), s]);

export const removeNormalSkin = (id: string) =>
  write(KEYS.libNormal, read(KEYS.libNormal).filter((s) => s.id !== id));
export const removeAngrySkin = (id: string) =>
  write(KEYS.libAngry, read(KEYS.libAngry).filter((s) => s.id !== id));

export const setDefaultNormal = (id: string) => localStorage.setItem(KEYS.defNormal, id);
export const setDefaultAngry = (id: string) => localStorage.setItem(KEYS.defAngry, id);
export const getDefaultNormalId = () => localStorage.getItem(KEYS.defNormal) || BUILTIN_NORMAL.id;
export const getDefaultAngryId = () => localStorage.getItem(KEYS.defAngry) || BUILTIN_ANGRY.id;

export const getSelectedNormalId = () =>
  localStorage.getItem(KEYS.selNormal) || getDefaultNormalId();
export const getSelectedAngryId = () =>
  localStorage.getItem(KEYS.selAngry) || getDefaultAngryId();
export const setSelectedNormalId = (id: string) => localStorage.setItem(KEYS.selNormal, id);
export const setSelectedAngryId = (id: string) => localStorage.setItem(KEYS.selAngry, id);

export const findSkin = (lib: Skin[], id: string): Skin =>
  lib.find((s) => s.id === id) || lib[0];

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

// ---------- Skin Packs (AI-generated normal+angry pairs) ----------

export const BUILTIN_PACK: SkinPack = {
  id: "builtin-pack",
  name: "Default Ojisan",
  normalDataUrl: normalDefault,
  angryDataUrl: angryDefault,
  builtin: true,
};

const readPacks = (): SkinPack[] => {
  try {
    const raw = localStorage.getItem(KEYS.packs);
    return raw ? (JSON.parse(raw) as SkinPack[]) : [];
  } catch {
    return [];
  }
};
const writePacks = (packs: SkinPack[]) =>
  localStorage.setItem(KEYS.packs, JSON.stringify(packs));

export const getSkinPacks = (): SkinPack[] => [BUILTIN_PACK, ...readPacks()];
export const addSkinPack = (p: SkinPack) => writePacks([...readPacks(), p]);
export const removeSkinPack = (id: string) =>
  writePacks(readPacks().filter((p) => p.id !== id));

export const getDefaultPackId = () =>
  localStorage.getItem(KEYS.defPack) || BUILTIN_PACK.id;
export const setDefaultPackId = (id: string) =>
  localStorage.setItem(KEYS.defPack, id);

export const getSelectedPackId = () =>
  localStorage.getItem(KEYS.selPack) || getDefaultPackId();
export const setSelectedPackId = (id: string) =>
  localStorage.setItem(KEYS.selPack, id);

export const findPack = (id: string): SkinPack => {
  const all = getSkinPacks();
  return all.find((p) => p.id === id) || all[0];
};

