import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_PASSWORD,
  Skin,
  addAngrySkin,
  addNormalSkin,
  fileToDataUrl,
  getAngryLibrary,
  getDefaultAngryId,
  getDefaultNormalId,
  getNormalLibrary,
  isAdmin,
  removeAngrySkin,
  removeNormalSkin,
  setAdmin,
  setDefaultAngry,
  setDefaultNormal,
} from "@/lib/skins";
import { WoodButton } from "@/components/WoodButton";

const Admin = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(isAdmin());
  const [pw, setPw] = useState("");
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

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
            ← Back to game
          </button>
        </div>
      </div>
    );
  }

  const normals = getNormalLibrary();
  const angries = getAngryLibrary();
  const defNormalId = getDefaultNormalId();
  const defAngryId = getDefaultAngryId();

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "normal" | "angry",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const name = prompt("Skin name?", file.name.replace(/\.[^.]+$/, "")) || "Untitled";
    const skin: Skin = { id: `${kind}-${Date.now()}`, name, dataUrl };
    if (kind === "normal") addNormalSkin(skin);
    else addAngrySkin(skin);
    e.target.value = "";
    refresh();
  };

  const Section = ({
    title,
    skins,
    kind,
    defaultId,
  }: {
    title: string;
    skins: Skin[];
    kind: "normal" | "angry";
    defaultId: string;
  }) => (
    <div className="bg-[hsl(var(--cream))] ink-outline rounded-2xl p-4" style={{ boxShadow: "0 5px 0 hsl(var(--ink))" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-black text-[hsl(var(--ink))] text-lg">{title}</div>
        <label className="px-3 py-1.5 rounded-full bg-[hsl(var(--yellow))] ink-outline-2 font-black text-sm text-[hsl(var(--ink))] cursor-pointer btn-press">
          + UPLOAD
          <input type="file" accept="image/*" hidden onChange={(e) => handleUpload(e, kind)} />
        </label>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {skins.map((s) => {
          const isDefault = s.id === defaultId;
          return (
            <div key={s.id} className="flex flex-col gap-1">
              <div className={`aspect-square ink-outline-2 rounded-lg overflow-hidden flex items-center justify-center ${isDefault ? "bg-[hsl(var(--yellow-glow))]" : "bg-white"}`}>
                <img src={s.dataUrl} alt={s.name} className="w-full h-full object-contain" />
              </div>
              <div className="text-xs font-black text-center text-[hsl(var(--ink))] truncate">{s.name}{s.builtin ? " ★" : ""}</div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    kind === "normal" ? setDefaultNormal(s.id) : setDefaultAngry(s.id);
                    refresh();
                  }}
                  className={`flex-1 text-[10px] font-black py-1 rounded ink-outline-2 ${isDefault ? "bg-[hsl(var(--yellow))]" : "bg-white"}`}
                >
                  {isDefault ? "DEFAULT" : "SET"}
                </button>
                {!s.builtin && (
                  <button
                    onClick={() => {
                      if (!confirm(`Delete ${s.name}?`)) return;
                      kind === "normal" ? removeNormalSkin(s.id) : removeAngrySkin(s.id);
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
  );

  return (
    <div className="wood-bg min-h-screen overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/")} className="px-4 py-2 ink-outline rounded-full bg-[hsl(var(--cream))] font-black text-[hsl(var(--ink))] btn-press" style={{ boxShadow: "0 4px 0 hsl(var(--ink))" }}>← BACK</button>
          <div className="font-black text-[hsl(var(--cream))] text-xl">ADMIN</div>
          <button onClick={() => { setAdmin(false); setAuthed(false); }} className="px-3 py-2 ink-outline rounded-full bg-[hsl(var(--ink))] text-white font-black text-sm btn-press">LOGOUT</button>
        </div>
        <Section title="NORMAL SKINS" skins={normals} kind="normal" defaultId={defNormalId} />
        <Section title="ANGRY SKINS" skins={angries} kind="angry" defaultId={defAngryId} />
      </div>
    </div>
  );
};

export default Admin;
