import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSelectedPackId,
  getSkinPacks,
  setSelectedPackId,
} from "@/lib/skins";

const SkinSelect = () => {
  const navigate = useNavigate();
  const [sel, setSel] = useState(getSelectedPackId());
  const packs = getSkinPacks();

  const pick = (id: string) => {
    setSelectedPackId(id);
    setSel(id);
  };

  return (
    <div className="wood-bg min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-3">
        <button onClick={() => navigate("/")} className="px-4 py-2 ink-outline rounded-full bg-[hsl(var(--cream))] font-black text-[hsl(var(--ink))] btn-press" style={{ boxShadow: "0 4px 0 hsl(var(--ink))" }}>← BACK</button>
        <div className="font-black text-[hsl(var(--cream))] text-xl">SKIN PACKS</div>
        <div className="w-16" />
      </div>

      <div className="px-4 py-4 flex-1 overflow-y-auto">
        <div className="bg-[hsl(var(--cream))] ink-outline rounded-2xl p-4" style={{ boxShadow: "0 5px 0 hsl(var(--ink))" }}>
          <div className="grid grid-cols-2 gap-3">
            {packs.map((p) => {
              const active = p.id === sel;
              return (
                <button
                  key={p.id}
                  onClick={() => pick(p.id)}
                  className={`flex flex-col gap-2 btn-press p-2 rounded-xl ink-outline-2 ${active ? "bg-[hsl(var(--yellow-glow))] ring-4 ring-[hsl(var(--yellow))]" : "bg-white"}`}
                >
                  <div className="grid grid-cols-2 gap-1">
                    <div className="aspect-square ink-outline-2 rounded-lg overflow-hidden bg-white">
                      <img src={p.normalDataUrl} alt={`${p.name} normal`} className="w-full h-full object-contain" />
                    </div>
                    <div className="aspect-square ink-outline-2 rounded-lg overflow-hidden bg-white">
                      <img src={p.angryDataUrl} alt={`${p.name} angry`} className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="text-sm font-black text-center text-[hsl(var(--ink))] truncate">{p.name}{p.builtin ? " ★" : ""}</div>
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
