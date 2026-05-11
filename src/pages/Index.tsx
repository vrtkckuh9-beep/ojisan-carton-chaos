import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SkinFace } from "@/components/SkinFace";
import { WoodButton } from "@/components/WoodButton";
import {
  SkinMode,
  SkinPack,
  getSkinMode,
  getSkinPacks,
  getSelectedPack,
  setSkinMode,
} from "@/lib/skins";
import { playRandomSound, playFallbackPop, playFallbackAngry } from "@/lib/audio";

type Screen = "title" | "game" | "gallery";

const NUM_OPTIONS = [9, 16, 25, 36] as const;
type NumOpt = (typeof NUM_OPTIONS)[number];

const QUOTES = [
  "My head is itchy",
  "He snores a lot",
  "Goodbye",
  "Sauce for fried eggs, right?",
  "You see the pudding?",
  "There is only one Angry uncle",
  "Pass the soy sauce",
  "I forgot my umbrella",
  "Where is the remote",
  "Tea is getting cold",
];

const CHARACTERS = [
  "Don't be silly", "Be Quiet", "Kurtz!",
  "Daibutsu", "Blur", "Mucha",
  "Edokko", "Skin head", "Googly eyes",
  "Hirsute", "John", "Easy to forget", "Shout",
];

const cols = (n: NumOpt) => Math.sqrt(n);

const Index = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("title");
  const [num, setNum] = useState<NumOpt>(16);
  const [mode, setModeState] = useState<SkinMode>(getSkinMode);
  const [angryIndex, setAngryIndex] = useState(0);
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [quote, setQuote] = useState(QUOTES[0]);
  const [revealed, setRevealed] = useState(false);
  const [scolded, setScolded] = useState<number>(() => Number(localStorage.getItem("scolded") || 0));
  const [showEndButtons, setShowEndButtons] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [faceAnimations, setFaceAnimations] = useState<Record<number, string>>({});
  const [boardPacks, setBoardPacks] = useState<SkinPack[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const [cheatMode, setCheatMode] = useState<boolean>(
    () => localStorage.getItem("angryOjisan_cheatMode") === "true"
  );
  const [cheatToast, setCheatToast] = useState<string | null>(null);
  const [secretTaps, setSecretTaps] = useState<number[]>([]);

  const selectedPack = getSelectedPack();

  const handleSecretTap = () => {
    const now = Date.now();
    const recent = [...secretTaps, now].filter((t) => now - t <= 1500);
    if (recent.length >= 3) {
      const next = !cheatMode;
      setCheatMode(next);
      localStorage.setItem("angryOjisan_cheatMode", String(next));
      setCheatToast(next ? "Cheat Mode Activated" : "Cheat Mode Disabled");
      playFallbackPop();
      if ("vibrate" in navigator) {
        try { (navigator as any).vibrate?.(40); } catch {}
      }
      setSecretTaps([]);
      setTimeout(() => setCheatToast(null), 1600);
    } else {
      setSecretTaps(recent);
    }
  };

  const startGame = useCallback(() => {
    const packs = getSkinPacks();
    setAngryIndex(Math.floor(Math.random() * num));
    setRemoved(new Set());
    setRevealed(false);
    setShowEndButtons(false);
    setShaking(false);
    setFaceAnimations({});
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    setTapCount(0);

    if (mode === "multi") {
      setBoardPacks(packs);
    } else {
      setBoardPacks([selectedPack]);
    }

    setScreen("game");
  }, [num, mode, selectedPack]);

  const tapFace = (i: number) => {
    if (removed.has(i) || revealed || faceAnimations[i]) return;

    // Cheat: "Second Player Always Wins"
    // Turn 1 (P1) and even turns (P2) are protected from angry.
    // Angry only allowed on odd turns >= 3 (P1's subsequent turns).
    const turn = tapCount + 1;
    let effectiveAngry = i === angryIndex;
    if (cheatMode && effectiveAngry && (turn === 1 || turn % 2 === 0)) {
      // Reroute angry to a different remaining tile
      const candidates: number[] = [];
      for (let k = 0; k < num; k++) {
        if (k !== i && !removed.has(k)) candidates.push(k);
      }
      if (candidates.length) {
        const newAngry = candidates[Math.floor(Math.random() * candidates.length)];
        setAngryIndex(newAngry);
      }
      effectiveAngry = false;
    }

    setTapCount((c) => c + 1);

    if (effectiveAngry) {
      const angryPack = getAngryPack();
      playRandomSound(angryPack.angrySounds, playFallbackAngry);
      setRevealed(true);
      setShaking(true);
      const s = scolded + 1;
      setScolded(s);
      localStorage.setItem("scolded", String(s));
      setTimeout(() => setShaking(false), 600);
      setTimeout(() => setShowEndButtons(true), 1000);
    } else {
      const facePack = getFacePack(i);
      playRandomSound(facePack.normalSounds, playFallbackPop);
      setFaceAnimations((prev) => ({ ...prev, [i]: "flip-spin-fly" }));
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
      setTimeout(() => {
        setRemoved((prev) => new Set([...prev, i]));
      }, 800);
    }
  };

  const getFacePack = (index: number): SkinPack => {
    if (mode === "multi" && boardPacks.length > 1) {
      return boardPacks[index % boardPacks.length];
    }
    return selectedPack;
  };

  const getAngryPack = (): SkinPack => {
    if (mode === "multi" && boardPacks.length > 1) {
      return boardPacks[angryIndex % boardPacks.length];
    }
    return selectedPack;
  };

  // ---------- TITLE ----------
  if (screen === "title") {
    return (
      <div className="wood-bg min-h-screen flex flex-col items-center">
        <div className="flex-1 w-full max-w-md mx-auto px-5 py-6 flex flex-col items-center justify-center gap-4">
          {/* Carton package */}
          <button onClick={startGame} className="w-full ink-outline rounded-xl bg-[hsl(var(--cream))] overflow-hidden btn-press text-left" style={{ boxShadow: "0 6px 0 hsl(var(--ink))" }}>
            <div className="h-3 bg-[hsl(var(--cream))]" />
            <div className="h-1 bg-[hsl(var(--ink))]" />
            <div className="h-2 bg-white" />
            <div className="h-1 bg-[hsl(var(--ink))]" />
            <div className="bg-[hsl(var(--maroon))] px-4 py-5 flex items-center gap-3 relative">
              <div className="flex-1">
                <div className="font-black leading-none text-[hsl(var(--orange))] text-stroke-white text-shadow-hard tracking-tight" style={{ fontSize: "2.6rem", lineHeight: 0.9 }}>
                  ANGRY
                </div>
                <div className="font-black leading-none text-[hsl(var(--yellow))] text-stroke-white text-shadow-hard tracking-tight mt-1" style={{ fontSize: "2.6rem", lineHeight: 0.9 }}>
                  OJISAN
                </div>
              </div>
              <div className="w-20 h-20 bg-white rounded-full ink-outline flex items-center justify-center shrink-0 overflow-hidden">
                <SkinFace src={selectedPack.angryDataUrl} className="w-[95%] h-[95%]" />
              </div>
            </div>
            <div className="h-1 bg-[hsl(var(--ink))]" />
            <div className="h-2 bg-white" />
            <div className="h-1 bg-[hsl(var(--ink))]" />
            <div className="h-3 bg-[hsl(var(--cream))]" />
          </button>

          {/* Num selector */}
          <div className="w-full bg-[hsl(var(--ink))] ink-outline rounded-full p-1 flex items-center gap-1">
            <span className="text-white font-black px-3 text-sm">Num</span>
            {NUM_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setNum(n)}
                className={`flex-1 py-2 rounded-full font-black text-base ink-outline-2 transition-colors ${
                  num === n ? "bg-[hsl(var(--yellow))] text-[hsl(var(--ink))]" : "bg-[hsl(0_0%_45%)] text-white"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Skin mode selector */}
          <div className="w-full bg-[hsl(var(--ink))] ink-outline rounded-full p-1 flex items-center gap-1">
            <button
              onClick={() => { setSkinMode("single"); setModeState("single"); }}
              className={`flex-1 py-2 rounded-full font-black text-base ink-outline-2 transition-colors ${
                mode === "single" ? "bg-[hsl(var(--yellow))] text-[hsl(var(--ink))]" : "bg-[hsl(0_0%_45%)] text-white"
              }`}
            >
              1
            </button>
            <button
              onClick={() => { setSkinMode("multi"); setModeState("multi"); }}
              className={`flex-1 py-2 rounded-full font-black text-base ink-outline-2 transition-colors ${
                mode === "multi" ? "bg-[hsl(var(--yellow))] text-[hsl(var(--ink))]" : "bg-[hsl(0_0%_45%)] text-white"
              }`}
            >
              MULTI
            </button>
          </div>

          <div className="w-full flex items-center gap-3 mt-1">
            <div className="flex-1 flex flex-col gap-3">
              <WoodButton onClick={startGame}>START</WoodButton>
              <WoodButton onClick={() => navigate("/skins")}>SKIN</WoodButton>
              <WoodButton onClick={() => setScreen("gallery")}>SETTING</WoodButton>
            </div>
            <div className="flex flex-col gap-3">
              <button
                aria-label="help"
                onClick={() => alert("Tap faces to find the Angry Uncle hiding among them!")}
                className="w-12 h-12 rounded-full ink-outline flex items-center justify-center text-white font-black text-2xl bg-transparent btn-press"
                style={{ boxShadow: "0 4px 0 hsl(var(--ink))" }}
              >
                ?
              </button>
              <button
                aria-label="admin"
                onClick={() => navigate("/admin")}
                className="w-12 h-12 rounded-full ink-outline flex items-center justify-center text-white font-black text-sm bg-[hsl(var(--ink))] btn-press"
                style={{ boxShadow: "0 4px 0 hsl(var(--wood-dark))" }}
              >
                ⚙
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- GAME ----------
  if (screen === "game") {
    const c = cols(num);
    const angryPack = getAngryPack();
    return (
      <div className={`wood-bg min-h-screen flex flex-col ${shaking ? "animate-screen-shake" : ""}`}>
        {/* Rage flash overlay */}
        {revealed && (
          <div className="fixed inset-0 bg-[hsl(var(--angry))] animate-rage-flash pointer-events-none z-40" />
        )}

        {/* Quote banner */}
        <div className="px-3 pt-3">
          <div className="bg-[hsl(var(--cream))] ink-outline rounded-xl py-3 px-4 text-center font-black text-[hsl(var(--ink))] text-base" style={{ boxShadow: "0 4px 0 hsl(var(--ink))" }}>
            <span key={quote} className="inline-block animate-fade-up">「{quote}」</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md relative">
            <div
              className="w-full ink-outline rounded-2xl bg-[hsl(var(--cream))] p-3 animate-pop-in"
              style={{ boxShadow: "0 6px 0 hsl(var(--ink))", aspectRatio: "1/1" }}
            >
              <div
                className="w-full h-full grid gap-2"
                style={{ gridTemplateColumns: `repeat(${c}, minmax(0,1fr))`, gridTemplateRows: `repeat(${c}, minmax(0,1fr))` }}
              >
                {Array.from({ length: num }).map((_, i) => {
                  const isRemoved = removed.has(i);
                  const isAngry = i === angryIndex;
                  const showAngry = revealed && isAngry;
                  const anim = faceAnimations[i];
                  const facePack = isAngry ? angryPack : getFacePack(i);

                  return (
                    <div key={i} className="relative flex items-center justify-center overflow-visible">
                      {!isRemoved && !showAngry && (
                        <button
                          onClick={() => tapFace(i)}
                          className={`w-full h-full btn-press ${anim === "flip-spin-fly" ? "animate-flip-spin-fly" : ""}`}
                        >
                          <SkinFace src={facePack.normalDataUrl} className="w-full h-full" />
                        </button>
                      )}
                      {showAngry && (
                        <div className="absolute inset-0 flex items-center justify-center z-50 animate-angry-explode">
                          <SkinFace src={angryPack.angryDataUrl} className="w-full h-full" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {revealed && (
              <div className="absolute inset-0 flex items-start justify-center pointer-events-none pt-2 z-50">
                <div className="bg-[hsl(var(--yellow))] ink-outline rounded-xl px-5 py-2 font-black text-xl text-[hsl(var(--ink))] text-shadow-hard animate-pop-in" style={{ boxShadow: "0 4px 0 hsl(var(--ink))" }}>
                  Angry Uncle Appears!
                </div>
              </div>
            )}
          </div>
        </div>

        {showEndButtons ? (
          <div className="px-4 pb-4 w-full max-w-md mx-auto flex flex-col gap-2 animate-fade-up">
            <div className="text-center text-[hsl(var(--cream))] font-black">Scolded: {scolded}</div>
            <WoodButton variant="yellow" onClick={startGame}>REPLAY</WoodButton>
            <WoodButton onClick={() => setScreen("title")}>TITLE</WoodButton>
          </div>
        ) : (
          <div className="px-3 pb-4">
            <button
              onClick={() => setScreen("title")}
              className="w-full py-2 ink-outline rounded-full bg-[hsl(var(--ink))] text-white font-black btn-press"
              style={{ boxShadow: "0 4px 0 hsl(var(--wood-dark))" }}
            >
              TITLE
            </button>
          </div>
        )}
      </div>
    );
  }

  // ---------- GALLERY / SETTING ----------
  const unlocked = Math.min(CHARACTERS.length, Math.floor(scolded / 3));
  return (
    <div className="wood-bg min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-3">
        <button onClick={() => setScreen("title")} className="px-4 py-2 ink-outline rounded-full bg-[hsl(var(--cream))] font-black text-[hsl(var(--ink))] btn-press" style={{ boxShadow: "0 4px 0 hsl(var(--ink))" }}>BACK</button>
        <div className="font-black text-[hsl(var(--cream))] text-lg">SETTING</div>
        <div className="w-16" />
      </div>

      <div className="px-4 pb-4 flex-1 overflow-y-auto">
        <div className="bg-[hsl(var(--cream))] ink-outline rounded-xl p-4" style={{ boxShadow: "0 5px 0 hsl(var(--ink))" }}>
          <div className="font-black text-center text-[hsl(var(--ink))] mb-3">Released by watching ads</div>
          <div className="grid grid-cols-3 gap-3">
            {CHARACTERS.map((name, i) => {
              const isUnlocked = i < unlocked;
              return (
                <div key={name} className="flex flex-col items-center gap-1">
                  <div className={`w-full aspect-square ink-outline-2 rounded-lg flex items-center justify-center ${isUnlocked ? "bg-[hsl(var(--yellow-glow))]" : "bg-[hsl(var(--cream-dark))]"}`}>
                    <SkinFace
                      src={isUnlocked ? selectedPack.normalDataUrl : selectedPack.angryDataUrl}
                      className="w-[85%] h-[85%]"
                      style={isUnlocked ? {} : { filter: "brightness(0) opacity(0.3)" }}
                    />
                  </div>
                  <div className="text-[10px] font-black text-[hsl(var(--ink))] text-center leading-tight">{name}</div>
                  <button className="text-[9px] font-bold bg-[hsl(var(--ink))] text-white rounded-full px-2 py-0.5">
                    {isUnlocked ? "Unlocked" : "See ads"}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center font-black text-[hsl(var(--ink))]">
            Count of scolded: {scolded}
          </div>
          <div className="text-center text-xs text-[hsl(var(--ink))] mt-1 opacity-80">
            Depending on the number of scolded, The uncle will be released!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
