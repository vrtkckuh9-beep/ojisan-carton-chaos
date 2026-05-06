import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OjisanFace } from "@/components/OjisanFace";
import { FaceBorder } from "@/components/FaceBorder";
import { WoodButton } from "@/components/WoodButton";
import { SkinFace } from "@/components/SkinFace";
import {
  findSkin,
  getAngryLibrary,
  getNormalLibrary,
  getSelectedAngryId,
  getSelectedNormalId,
} from "@/lib/skins";

type Screen = "title" | "game" | "result" | "gallery";
type Mode = "easy" | "hard";
type Phase = "lid" | "open";

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
  const [mode, setMode] = useState<Mode>("easy");
  const [phase, setPhase] = useState<Phase>("lid");
  const [angryIndex, setAngryIndex] = useState(0);
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [quote, setQuote] = useState(QUOTES[0]);
  const [revealed, setRevealed] = useState(false);
  const [scolded, setScolded] = useState<number>(() => Number(localStorage.getItem("scolded") || 0));
  const [lidOpening, setLidOpening] = useState(false);

  const normalSkin = findSkin(getNormalLibrary(), getSelectedNormalId());
  const angrySkin = findSkin(getAngryLibrary(), getSelectedAngryId());

  const startGame = () => {
    setAngryIndex(Math.floor(Math.random() * num));
    setRemoved(new Set());
    setRevealed(false);
    setQuote("Touch the lid");
    setPhase("lid");
    setLidOpening(false);
    setScreen("game");
  };

  const openLid = () => {
    setLidOpening(true);
    setTimeout(() => {
      setPhase("open");
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, 600);
  };

  const tapFace = (i: number) => {
    if (removed.has(i) || revealed) return;
    if (i === angryIndex) {
      setRevealed(true);
      const s = scolded + 1;
      setScolded(s);
      localStorage.setItem("scolded", String(s));
      setTimeout(() => setScreen("result"), 1400);
    } else {
      setRemoved(new Set([...removed, i]));
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }
  };

  // ---------- TITLE ----------
  if (screen === "title") {
    return (
      <div className="wood-bg min-h-screen flex flex-col items-center overflow-hidden">
        <FaceBorder rows={2} />
        <div className="flex-1 w-full max-w-md mx-auto px-5 py-4 flex flex-col items-center justify-center gap-4">
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
                <SkinFace src={angrySkin.dataUrl} className="w-[95%] h-[95%]" />
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

          {/* Mode selector */}
          <div className="w-full bg-[hsl(var(--ink))] ink-outline rounded-full p-1 flex items-center gap-1">
            {(["easy", "hard"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-full font-black text-base ink-outline-2 flex items-center justify-center gap-2 capitalize ${
                  mode === m ? "bg-[hsl(var(--yellow))] text-[hsl(var(--ink))]" : "bg-[hsl(0_0%_45%)] text-white"
                }`}
              >
                <span className="w-6 h-6"><OjisanFace variant="normal" triple={m === "hard"} className="w-full h-full" /></span>
                {m}
              </button>
            ))}
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
        <FaceBorder rows={2} />
      </div>
    );
  }

  // ---------- GAME ----------
  if (screen === "game") {
    const c = cols(num);
    return (
      <div className="wood-bg min-h-screen flex flex-col">
        {/* Quote banner */}
        <div className="px-3 pt-3">
          <div className="bg-[hsl(var(--cream))] ink-outline rounded-xl py-3 px-4 text-center font-black text-[hsl(var(--ink))] text-base" style={{ boxShadow: "0 4px 0 hsl(var(--ink))" }}>
            <span key={quote} className="inline-block animate-fade-up">「{quote}」</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {phase === "lid" ? (
              <button
                onClick={openLid}
                className="w-full ink-outline rounded-2xl bg-[hsl(var(--cream))] overflow-hidden btn-press"
                style={{ boxShadow: "0 6px 0 hsl(var(--ink))", aspectRatio: "1/1" }}
              >
                <div className={`w-full h-full bg-[hsl(var(--maroon))] flex items-center justify-center ${lidOpening ? "animate-lid-open" : "animate-wiggle"}`}>
                  <div className="text-[hsl(var(--yellow))] text-stroke-white text-shadow-hard font-black text-3xl text-center px-4">
                    TOUCH<br/>THE LID
                  </div>
                </div>
              </button>
            ) : (
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
                    const scatter = revealed && !isAngry;
                    const tx = (Math.random() - 0.5) * 400 + "px";
                    const ty = (Math.random() - 0.5) * 400 + "px";
                    const tr = (Math.random() - 0.5) * 720 + "deg";
                    return (
                      <div key={i} className="relative bg-[hsl(var(--cream-dark))] ink-outline-2 rounded-full flex items-center justify-center overflow-visible">
                        {!isRemoved && (
                          <button
                            onClick={() => tapFace(i)}
                            className={`w-[110%] h-[110%] btn-press ${scatter ? "animate-scatter" : ""} ${showAngry ? "animate-angry-erupt" : ""}`}
                            style={scatter ? ({ ["--tx" as any]: tx, ["--ty" as any]: ty, ["--tr" as any]: tr } as React.CSSProperties) : undefined}
                          >
                            <SkinFace src={showAngry ? angrySkin.dataUrl : normalSkin.dataUrl} className="w-full h-full" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-3 pb-4">
          <button
            onClick={() => setScreen("title")}
            className="w-full py-2 ink-outline rounded-full bg-[hsl(var(--ink))] text-white font-black btn-press"
            style={{ boxShadow: "0 4px 0 hsl(var(--wood-dark))" }}
          >
            TITLE
          </button>
        </div>
      </div>
    );
  }

  // ---------- RESULT ----------
  if (screen === "result") {
    return (
      <div className="wood-bg min-h-screen flex flex-col items-center justify-center p-5 gap-5">
        <div className="bg-[hsl(var(--yellow))] ink-outline rounded-xl px-6 py-3 font-black text-2xl text-[hsl(var(--ink))] text-shadow-hard animate-pop-in" style={{ boxShadow: "0 5px 0 hsl(var(--ink))" }}>
          Angry Uncle Appears!
        </div>
        <div className="w-72 h-72 ink-outline rounded-2xl bg-[hsl(var(--cream))] flex items-center justify-center animate-shake overflow-hidden" style={{ boxShadow: "0 6px 0 hsl(var(--ink))" }}>
          <SkinFace src={angrySkin.dataUrl} className="w-[95%] h-[95%] animate-angry-erupt" />
        </div>
        <div className="text-[hsl(var(--cream))] font-black text-lg">Scolded: {scolded}</div>
        <div className="w-full max-w-xs flex flex-col gap-3">
          <WoodButton variant="yellow" onClick={startGame}>REPLAY</WoodButton>
          <WoodButton onClick={() => setScreen("gallery")}>REVIEW</WoodButton>
          <WoodButton onClick={() => setScreen("title")}>TITLE</WoodButton>
        </div>
      </div>
    );
  }

  // ---------- GALLERY ----------
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
                    <OjisanFace variant={isUnlocked ? "tiny" : "silhouette"} className="w-[85%] h-[85%]" />
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
