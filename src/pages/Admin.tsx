import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_PASSWORD,
  SkinPack,
  addSkinPack,
  canDeletePack,
  fileToDataUrl,
  getSkinPacks,
  isAdmin,
  removeSkinPack,
  setAdmin,
  setSelectedPackId,
  updateSkinPack,
} from "@/lib/skins";
import { WoodButton } from "@/components/WoodButton";
import { playSound, playFallbackPop, playFallbackAngry } from "@/lib/audio";

const shortLabel = (s: string, i: number) => {
  if (s.startsWith("data:")) return `🎵 Upload #${i + 1}`;
  try {
    const u = new URL(s);
    return u.pathname.split("/").pop() || u.hostname;
  } catch {
    return s;
  }
};

const SoundList = ({
  label,
  sounds,
  onAdd,
  onRemove,
  testFallback,
}: {
  label: string;
  sounds: string[];
  onAdd: (url: string) => void;
  onRemove: (idx: number) => void;
  testFallback: () => void;
}) => {
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      const dataUrl = await fileToDataUrl(f);
      onAdd(dataUrl);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-black text-[hsl(var(--ink))]">{label}</div>
        <button
          onClick={testFallback}
          className="text-[10px] font-black px-2 py-1 rounded ink-outline-2 bg-[hsl(var(--cream-dark))] text-[hsl(var(--ink))]"
        >
          ▶ Test default
        </button>
      </div>
      {sounds.map((s, i) => (
        <div key={i} className="flex items-center gap-1">
          <button
            onClick={() => playSound(s)}
            className="text-[10px] font-black px-2 py-1 rounded ink-outline-2 bg-[hsl(var(--yellow))] text-[hsl(var(--ink))] shrink-0"
          >
            ▶
          </button>
          <div className="flex-1 text-[10px] font-bold text-[hsl(var(--ink))] truncate bg-white ink-outline-2 rounded px-2 py-1">
            {shortLabel(s, i)}
          </div>
          <button
            onClick={() => onRemove(i)}
            className="text-[10px] font-black px-2 py-1 rounded ink-outline-2 bg-[hsl(var(--angry))] text-white shrink-0"
          >
            X
          </button>
        </div>
      ))}
      <div className="flex gap-1">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Audio URL..."
          className="flex-1 ink-outline-2 rounded px-2 py-1 text-[11px] font-bold text-[hsl(var(--ink))] bg-white"
          onKeyDown={(e) => {
            if (e.key === "Enter" && url.trim()) {
              onAdd(url.trim());
              setUrl("");
            }
          }}
        />
        <button
          onClick={() => {
            if (url.trim()) {
              onAdd(url.trim());
              setUrl("");
            }
          }}
          className="text-[10px] font-black px-2 py-1 rounded ink-outline-2 bg-[hsl(var(--yellow))] text-[hsl(var(--ink))] shrink-0"
        >
          +
        </button>
        <label className="text-[10px] font-black px-2 py-1 rounded ink-outline-2 bg-[hsl(var(--accent))] text-white shrink-0 cursor-pointer">
          📁
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
    </div>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(isAdmin());
  const [pw, setPw] = useState("");
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);
  const normalRef = useRef<HTMLInputElement>(null);
  const angryRef = useRef<HTMLInputElement>(null);
  const [normalPreview, setNormalPreview] = useState<string | null>(null);
  const [angryPreview, setAngryPreview] = useState<string | null>(null);
  const [packName, setPackName] = useState("");
  const [expandedPack, setExpandedPack] = useState<string | null>(null);

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
                alert("Wrong password");
              }
            }}
          >
            ENTER
          </WoodButton>
          <button onClick={() => navigate("/")} className="text-xs underline text-[hsl(var(--ink))]">
            Back to game
          </button>
        </div>
      </div>
    );
  }

  const packs = getSkinPacks();
  const canDelete = canDeletePack();

  const handleNormalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await fileToDataUrl(file);
    setNormalPreview(url);
    if (!packName) setPackName(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleAngryFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await fileToDataUrl(file);
    setAngryPreview(url);
  };

  const handleAddPack = () => {
    if (!normalPreview || !angryPreview) {
      alert("Both normal and angry images are required!");
      return;
    }
    const name = packName.trim() || "Untitled Pack";
    const pack: SkinPack = {
      id: `pack-${Date.now()}`,
      name,
      normalDataUrl: normalPreview,
      angryDataUrl: angryPreview,
      normalSounds: [],
      angrySounds: [],
    };
    addSkinPack(pack);
    setNormalPreview(null);
    setAngryPreview(null);
    setPackName("");
    if (normalRef.current) normalRef.current.value = "";
    if (angryRef.current) angryRef.current.value = "";
    refresh();
  };

  const handleDelete = (pack: SkinPack) => {
    if (pack.builtin) return;
    if (!canDelete) {
      alert("At least one skin pack must remain.");
      return;
    }
    if (!confirm(`Delete "${pack.name}"?`)) return;
    removeSkinPack(pack.id);
    refresh();
  };

  const addSound = (pack: SkinPack, type: "normalSounds" | "angrySounds", url: string) => {
    const updated = { ...pack };
    updated[type] = [...(updated[type] || []), url];
    updateSkinPack(updated);
    refresh();
  };

  const removeSound = (pack: SkinPack, type: "normalSounds" | "angrySounds", idx: number) => {
    const updated = { ...pack };
    updated[type] = (updated[type] || []).filter((_, i) => i !== idx);
    updateSkinPack(updated);
    refresh();
  };

  return (
    <div className="wood-bg min-h-screen overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/")} className="px-4 py-2 ink-outline rounded-full bg-[hsl(var(--cream))] font-black text-[hsl(var(--ink))] btn-press" style={{ boxShadow: "0 4px 0 hsl(var(--ink))" }}>BACK</button>
          <div className="font-black text-[hsl(var(--cream))] text-xl">ADMIN</div>
          <button onClick={() => { setAdmin(false); setAuthed(false); }} className="px-3 py-2 ink-outline rounded-full bg-[hsl(var(--ink))] text-white font-black text-sm btn-press">LOGOUT</button>
        </div>

        {/* Upload new pack */}
        <div className="bg-[hsl(var(--cream))] ink-outline rounded-2xl p-4" style={{ boxShadow: "0 5px 0 hsl(var(--ink))" }}>
          <div className="font-black text-[hsl(var(--ink))] text-lg mb-3">ADD SKIN PACK</div>
          <input
            type="text"
            value={packName}
            onChange={(e) => setPackName(e.target.value)}
            placeholder="Pack name"
            className="w-full ink-outline-2 rounded-lg px-3 py-2 font-bold text-[hsl(var(--ink))] bg-white mb-3"
          />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex flex-col gap-2">
              <div className="text-xs font-black text-[hsl(var(--ink))]">NORMAL FACE</div>
              <label className="aspect-square ink-outline-2 rounded-lg overflow-hidden flex items-center justify-center bg-white cursor-pointer">
                {normalPreview ? (
                  <img src={normalPreview} alt="Normal" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[hsl(var(--ink))] font-black text-sm text-center p-2">+ Normal</span>
                )}
                <input ref={normalRef} type="file" accept="image/*" hidden onChange={handleNormalFile} />
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xs font-black text-[hsl(var(--ink))]">ANGRY FACE</div>
              <label className="aspect-square ink-outline-2 rounded-lg overflow-hidden flex items-center justify-center bg-white cursor-pointer">
                {angryPreview ? (
                  <img src={angryPreview} alt="Angry" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[hsl(var(--ink))] font-black text-sm text-center p-2">+ Angry</span>
                )}
                <input ref={angryRef} type="file" accept="image/*" hidden onChange={handleAngryFile} />
              </label>
            </div>
          </div>
          <WoodButton
            variant="yellow"
            onClick={handleAddPack}
            disabled={!normalPreview || !angryPreview}
          >
            ADD PACK
          </WoodButton>
        </div>

        {/* Existing packs */}
        <div className="bg-[hsl(var(--cream))] ink-outline rounded-2xl p-4" style={{ boxShadow: "0 5px 0 hsl(var(--ink))" }}>
          <div className="font-black text-[hsl(var(--ink))] text-lg mb-3">SKIN PACKS</div>
          <div className="flex flex-col gap-3">
            {packs.map((pack) => {
              const isExpanded = expandedPack === pack.id;
              return (
                <div key={pack.id} className="ink-outline-2 rounded-xl bg-white overflow-hidden">
                  <div className="p-3">
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      <div className="aspect-square ink-outline-2 rounded-lg overflow-hidden flex items-center justify-center bg-white">
                        <img src={pack.normalDataUrl} alt={`${pack.name} normal`} className="w-full h-full object-contain" />
                      </div>
                      <div className="aspect-square ink-outline-2 rounded-lg overflow-hidden flex items-center justify-center bg-white">
                        <img src={pack.angryDataUrl} alt={`${pack.name} angry`} className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <div className="text-xs font-black text-center text-[hsl(var(--ink))] truncate">{pack.name}{pack.builtin ? " *" : ""}</div>
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => {
                          setSelectedPackId(pack.id);
                          refresh();
                        }}
                        className="flex-1 text-[10px] font-black py-1 rounded ink-outline-2 bg-[hsl(var(--yellow))]"
                      >
                        SELECT
                      </button>
                      <button
                        onClick={() => setExpandedPack(isExpanded ? null : pack.id)}
                        className="flex-1 text-[10px] font-black py-1 rounded ink-outline-2 bg-[hsl(var(--accent))] text-white"
                      >
                        {isExpanded ? "CLOSE" : "SOUNDS"}
                      </button>
                      {!pack.builtin && (
                        <button
                          onClick={() => handleDelete(pack)}
                          className={`text-[10px] font-black py-1 px-2 rounded ink-outline-2 ${
                            canDelete ? "bg-[hsl(var(--angry))] text-white" : "bg-[hsl(var(--cream-dark))] text-[hsl(var(--ink))] opacity-50"
                          }`}
                        >
                          X
                        </button>
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t-2 border-[hsl(var(--ink))] p-3 bg-[hsl(var(--cream-dark)/0.3)] flex flex-col gap-3">
                      <SoundList
                        label="NORMAL SOUNDS"
                        sounds={pack.normalSounds || []}
                        onAdd={(url) => addSound(pack, "normalSounds", url)}
                        onRemove={(idx) => removeSound(pack, "normalSounds", idx)}
                        testFallback={playFallbackPop}
                      />
                      <SoundList
                        label="ANGRY SOUNDS"
                        sounds={pack.angrySounds || []}
                        onAdd={(url) => addSound(pack, "angrySounds", url)}
                        onRemove={(idx) => removeSound(pack, "angrySounds", idx)}
                        testFallback={playFallbackAngry}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {!canDelete && (
            <div className="mt-3 text-center text-xs font-bold text-[hsl(var(--angry-dark))]">
              At least one skin pack must remain.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
