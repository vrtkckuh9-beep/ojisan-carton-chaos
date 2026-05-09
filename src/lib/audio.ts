// Audio system: plays user-provided sounds (data URLs or external URLs),
// and falls back to procedural Web Audio synthesis when none are configured.

let ctx: AudioContext | null = null;
const getCtx = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
};

// Unlock on first user gesture (mobile policy)
if (typeof window !== "undefined") {
  const unlock = () => {
    getCtx();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("touchstart", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("touchstart", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}

const playTone = (
  freq: number,
  duration: number,
  type: OscillatorType = "square",
  gain = 0.18,
  freqEnd?: number
) => {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(40, freqEnd),
      ac.currentTime + duration
    );
  }
  g.gain.setValueAtTime(0.0001, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(g).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration + 0.02);
};

const playNoise = (duration: number, gain = 0.25) => {
  const ac = getCtx();
  if (!ac) return;
  const buf = ac.createBuffer(1, ac.sampleRate * duration, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  const g = ac.createGain();
  g.gain.value = gain;
  const filt = ac.createBiquadFilter();
  filt.type = "bandpass";
  filt.frequency.value = 800;
  src.connect(filt).connect(g).connect(ac.destination);
  src.start();
};

export const playFallbackPop = () => {
  // Cute "pop" / "boing" for normal face tap
  const freqs = [520, 660, 740, 880];
  const f = freqs[Math.floor(Math.random() * freqs.length)];
  playTone(f, 0.12, "triangle", 0.22, f * 1.6);
};

export const playFallbackAngry = () => {
  // Angry shout: noise burst + descending growl
  playNoise(0.18, 0.18);
  playTone(220, 0.45, "sawtooth", 0.28, 80);
  setTimeout(() => playTone(180, 0.3, "square", 0.22, 60), 120);
};

const audioPool: HTMLAudioElement[] = [];
const playUrl = (url: string) => {
  try {
    const a = new Audio(url);
    a.volume = 0.9;
    audioPool.push(a);
    if (audioPool.length > 8) {
      const old = audioPool.shift();
      try { old?.pause(); } catch {}
    }
    a.play().catch(() => {});
  } catch {}
};

export const playRandomSound = (
  sounds: string[] | undefined,
  fallback?: () => void
) => {
  if (sounds && sounds.length) {
    const idx = Math.floor(Math.random() * sounds.length);
    playUrl(sounds[idx]);
    return;
  }
  if (fallback) fallback();
};

export const playSound = (url: string) => playUrl(url);
