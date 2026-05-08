import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAngryLibrary,
  getNormalLibrary,
  getSelectedAngryId,
  getSelectedNormalId,
  setSelectedAngryId,
  setSelectedNormalId,
} from "@/lib/skins";

type Tab = "normal" | "angry";

const SkinSelect = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("normal");
  const [selN, setSelN] = useState(getSelectedNormalId());
  const [selA, setSelA] = useState(getSelectedAngryId());

  const normals = getNormalLibrary();
  const angries = getAngryLibrary();
  const skins = tab === "normal" ? normals : angries;
  const sel = tab === "normal" ? selN : selA;

  const pick = (id: string) => {
    if (tab === "normal") {
      setSelectedNormalId(id);
      setSelN(id);
    } else {
      setSelectedAngryId(id);
      setSelA(id);
    }
  };

  return (
    <div className="wood-bg min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-3">
        <button onClick={() => navigate("/")} className="px-4 py-2 ink-outline rounded-full bg-[hsl(var(--cream))] font-black text-[hsl(var(--ink))] btn-press" style={{ boxShadow: "0 4px 0 hsl(var(--ink))" }}>← BACK</button>
        <div className="font-black text-[hsl(var(--cream))] text-xl">SKIN</div>
        <div className="w-16" />
      </div>

      <div className="px-4">
        <div className="bg-[hsl(var(--ink))] ink-outline rounded-full p-1 flex gap-1">
          {(["normal", "angry"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-full font-black text-base ink-outline-2 capitalize ${
                tab === t ? "bg-[hsl(var(--yellow))] text-[hsl(var(--ink))]" : "bg-[hsl(0_0%_45%)] text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 flex-1 overflow-y-auto">
        <div className="bg-[hsl(var(--cream))] ink-outline rounded-2xl p-4" style={{ boxShadow: "0 5px 0 hsl(var(--ink))" }}>
          <div className="grid grid-cols-3 gap-3">
            {skins.map((s) => {
              const active = s.id === sel;
              return (
                <button
                  key={s.id}
                  onClick={() => pick(s.id)}
                  className={`flex flex-col gap-1 btn-press ${active ? "" : "opacity-90"}`}
                >
                  <div
                    className={`aspect-square ink-outline-2 rounded-lg overflow-hidden flex items-center justify-center ${
                      active ? "bg-[hsl(var(--yellow-glow))] ring-4 ring-[hsl(var(--yellow))]" : "bg-white"
                    }`}
                  >
                    <img src={s.dataUrl} alt={s.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="text-xs font-black text-center text-[hsl(var(--ink))] truncate">{s.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkinSelect;
