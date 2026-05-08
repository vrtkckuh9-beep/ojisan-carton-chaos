import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_PASSWORD,
  SkinPack,
  addSkinPack,
  fileToDataUrl,
  getDefaultPackId,
  getSkinPacks,
  isAdmin,
  removeSkinPack,
  setAdmin,
  setDefaultPackId,
} from "@/lib/skins";
import { WoodButton } from "@/components/WoodButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(isAdmin());
  const [pw, setPw] = useState("");
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [normalUrl, setNormalUrl] = useState<string | null>(null);
  const [angryUrl, setAngryUrl] = useState<string | null>(null);
  const [packName, setPackName] = useState("");
  const [busy, setBusy] = useState<null | "normal" | "angry" | "both">(null);

  if (!authed) {
    return (
      <div className="wood-bg min-h-screen flex items-center justify-center p-5">
        <div className="bg-[hsl(var(--cream))] ink-outline rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4" style={{ boxShadow: "0 6px 0 hsl(var(--ink))" }}>
          <div className="font-black text-2xl text-center text-[hsl(var(--ink))]">ADMIN LOGIN</div>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            className="ink-outline-2 rounded-lg px-3 py-2 font-bold text-[hsl(var(--ink))] bg-white"
          />
          <WoodButton
            variant="yellow"
            onClick={() => {
              if (pw === ADMIN_PASSWORD) {
                setAdmin(true);
                setAuthed(true);
              } else {
                toast.error("Wrong password");
              }
            }}
          >
            ENTER
          </WoodButton>
          <button onClick={() => navigate("/")} className="text-xs underline text-[hsl(var(--ink))]">
            ← Back to game
          </button>
        </div>
      </div>
    );
  }

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await fileToDataUrl(file);
    setSourceUrl(url);
    setNormalUrl(null);
    setAngryUrl(null);
    setPackName(file.name.replace(/\.[^.]+$/, ""));
    e.target.value = "";
  };

  const generate = async (variant: "normal" | "angry") => {
    if (!sourceUrl) return;
    setBusy(variant);
    try {
      const { data, error } = await supabase.functions.invoke("generate-skin", {
        body: { imageUrl: sourceUrl, variant },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const url = (data as any).dataUrl as string;
      if (variant === "normal") setNormalUrl(url);
      else setAngryUrl(url);
      toast.success(`${variant.toUpperCase()} skin generated`);
    } catch (err: any) {
      toast.error(err?.message || "Generation failed");
    } finally {
      setBusy(null);
    }
  };

  const generateBoth = async () => {
    if (!sourceUrl) return;
    setBusy("both");
    try {
      await generate("normal");
      await generate("angry");
    } finally {
      setBusy(null);
    }
  };

  const savePack = () => {
    if (!normalUrl || !angryUrl) {
      toast.error("Generate both faces first");
      return;
    }
    const name = packName.trim() || "Untitled Pack";
    const pack: SkinPack = {
      id: `pack-${Date.now()}`,
      name,
      normalDataUrl: normalUrl,
      angryDataUrl: angryUrl,
    };
    addSkinPack(pack);
    setSourceUrl(null);
    setNormalUrl(null);
    setAngryUrl(null);
    setPackName("");
    toast.success(`Saved "${name}"`);
    refresh();
  };

  const packs = getSkinPacks();
  const defId = getDefaultPackId();

  return (
    <div className="wood-bg min-h-screen overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/")} className="px-4 py-2 ink-outline rounded-full bg-[hsl(var(--cream))] font-black text-[hsl(var(--ink))] btn-press" style={{ boxShadow: "0 4px 0 hsl(var(--ink))" }}>← BACK</button>
          <div className="font-black text-[hsl(var(--cream))] text-xl">ADMIN</div>
          <button onClick={() => { setAdmin(false); setAuthed(false); }} className="px-3 py-2 ink-outline rounded-full bg-[hsl(var(--ink))] text-white font-black text-sm btn-press">LOGOUT</button>
        </div>

        {/* AI Generator */}
        <div className="bg-[hsl(var(--cream))] ink-outline rounded-2xl p-4 flex flex-col gap-3" style={{ boxShadow: "0 5px 0 hsl(var(--ink))" }}>
          <div className="font-black text-[hsl(var(--ink))] text-lg">🤖 AI SKIN GENERATOR</div>
          <p className="text-xs text-[hsl(var(--ink))] opacity-80">
            Upload a face photo. AI will generate a NORMAL and ANGRY pair in Angry Ojisan style.
          </p>

          <label className="px-3 py-2 rounded-full bg-[hsl(var(--yellow))] ink-outline-2 font-black text-sm text-[hsl(var(--ink))] cursor-pointer btn-press text-center">
            {sourceUrl ? "REPLACE PHOTO" : "+ UPLOAD FACE PHOTO"}
            <input type="file" accept="image/*" hidden onChange={onUpload} />
          </label>

          {sourceUrl && (
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1">
                <div className="aspect-square w-full ink-outline-2 rounded-lg overflow-hidden bg-white">
                  <img src={sourceUrl} alt="source" className="w-full h-full object-contain" />
                </div>
                <div className="text-[10px] font-black text-[hsl(var(--ink))]">SOURCE</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="aspect-square w-full ink-outline-2 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                  {normalUrl ? (
                    <img src={normalUrl} alt="normal" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-[10px] text-[hsl(var(--ink))] opacity-60">{busy === "normal" || busy === "both" ? "..." : "—"}</div>
                  )}
                </div>
                <div className="text-[10px] font-black text-[hsl(var(--ink))]">NORMAL</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="aspect-square w-full ink-outline-2 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                  {angryUrl ? (
                    <img src={angryUrl} alt="angry" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-[10px] text-[hsl(var(--ink))] opacity-60">{busy === "angry" || busy === "both" ? "..." : "—"}</div>
                  )}
                </div>
                <div className="text-[10px] font-black text-[hsl(var(--ink))]">ANGRY</div>
              </div>
            </div>
          )}

          {sourceUrl && (
            <>
              <div className="flex gap-2">
                <button
                  disabled={!!busy}
                  onClick={generateBoth}
                  className="flex-1 py-2 rounded-full bg-[hsl(var(--ink))] text-white font-black text-sm ink-outline-2 btn-press disabled:opacity-50"
                >
                  {busy === "both" ? "GENERATING..." : "✨ GENERATE BOTH"}
                </button>
                <button
                  disabled={!!busy}
                  onClick={() => generate("normal")}
                  className="px-3 py-2 rounded-full bg-white text-[hsl(var(--ink))] font-black text-xs ink-outline-2 btn-press disabled:opacity-50"
                >
                  {busy === "normal" ? "..." : "NORMAL"}
                </button>
                <button
                  disabled={!!busy}
                  onClick={() => generate("angry")}
                  className="px-3 py-2 rounded-full bg-[hsl(var(--angry))] text-white font-black text-xs ink-outline-2 btn-press disabled:opacity-50"
                >
                  {busy === "angry" ? "..." : "ANGRY"}
                </button>
              </div>

              <input
                type="text"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                placeholder="Skin pack name"
                className="ink-outline-2 rounded-lg px-3 py-2 font-bold text-[hsl(var(--ink))] bg-white"
              />
              <WoodButton variant="yellow" onClick={savePack}>
                💾 SAVE SKIN PACK
              </WoodButton>
            </>
          )}
        </div>

        {/* Pack library */}
        <div className="bg-[hsl(var(--cream))] ink-outline rounded-2xl p-4" style={{ boxShadow: "0 5px 0 hsl(var(--ink))" }}>
          <div className="font-black text-[hsl(var(--ink))] text-lg mb-3">SKIN PACK LIBRARY</div>
          <div className="grid grid-cols-2 gap-3">
            {packs.map((p) => {
              const isDef = p.id === defId;
              return (
                <div key={p.id} className={`flex flex-col gap-2 p-2 rounded-xl ink-outline-2 ${isDef ? "bg-[hsl(var(--yellow-glow))]" : "bg-white"}`}>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="aspect-square ink-outline-2 rounded-lg overflow-hidden bg-white">
                      <img src={p.normalDataUrl} alt="normal" className="w-full h-full object-contain" />
                    </div>
                    <div className="aspect-square ink-outline-2 rounded-lg overflow-hidden bg-white">
                      <img src={p.angryDataUrl} alt="angry" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="text-xs font-black text-center text-[hsl(var(--ink))] truncate">{p.name}{p.builtin ? " ★" : ""}</div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setDefaultPackId(p.id); refresh(); }}
                      className={`flex-1 text-[10px] font-black py-1 rounded ink-outline-2 ${isDef ? "bg-[hsl(var(--yellow))]" : "bg-white"}`}
                    >
                      {isDef ? "DEFAULT" : "SET DEFAULT"}
                    </button>
                    {!p.builtin && (
                      <button
                        onClick={() => {
                          if (!confirm(`Delete ${p.name}?`)) return;
                          removeSkinPack(p.id);
                          refresh();
                        }}
                        className="text-[10px] font-black py-1 px-2 rounded ink-outline-2 bg-[hsl(var(--angry))] text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
