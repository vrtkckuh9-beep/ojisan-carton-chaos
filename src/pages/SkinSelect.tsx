import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSkinPacks,
  getSelectedPackId,
  setSelectedPackId,
} from "@/lib/skins";

const SkinSelect = () => {
  const navigate = useNavigate();
  const [selId, setSelId] = useState(getSelectedPackId());

  const packs = getSkinPacks();

  const pick = (id: string) => {
    setSelectedPackId(id);
    setSelId(id);
  };

  return (
    <div className="wood-bg min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-3">
        <button onClick={() => navigate("/")} className="px-4 py-2 ink-outline rounded-full bg-[hsl(var(--cream))] font-black text-[hsl(var(--ink))] btn-press" style={{ boxShadow: "0 4px 0 hsl(var(--ink))" }}>← BACK</button>
        <div className="font-black text-[hsl(var(--cream))] text-xl">SKIN</div>
        <div className="w-16" />
      </div>

      <div className="px-4 py-4 flex-1 overflow-y-auto">
        <div className="bg-[hsl(var(--cream))] ink-outline rounded-2xl p-4" style={{ boxShadow: "0 5px 0 hsl(var(--ink))" }}>
          <div className="font-black text-[hsl(var(--ink))] text-sm mb-3 text-center">Select a skin pack</div>
          <div className="grid grid-cols-2 gap-3">
            {packs.map((pack) => {
              const active = pack.id === selId;
              return (
                <button
                  key={pack.id}
                  onClick={() => pick(pack.id)}
                  className={`flex flex-col gap-1 btn-press ${active ? "" : "opacity-90"}`}
                >
                  <div
                    className={`grid grid-cols-2 gap-0.5 ink-outline-2 rounded-lg overflow-hidden ${
                      active ? "ring-4 ring-[hsl(var(--yellow))]" : ""
                    }`}
                  >
                    <div className="aspect-square bg-white flex items-center justify-center">
                      <img src={pack.normalDataUrl} alt={`${pack.name} normal`} className="w-full h-full object-contain" />
                    </div>
                    <div className="aspect-square bg-white flex items-center justify-center">
                      <img src={pack.angryDataUrl} alt={`${pack.name} angry`} className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="text-xs font-black text-center text-[hsl(var(--ink))] truncate">{pack.name}{pack.builtin ? " ★" : ""}</div>
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
