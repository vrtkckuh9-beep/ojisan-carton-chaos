let currentAudio: HTMLAudioElement | null = null;

export const playSound = (url: string) => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  const audio = new Audio(url);
  currentAudio = audio;
  audio.play().catch(() => {});
};

export const playRandomSound = (sounds: string[]) => {
  if (!sounds.length) return;
  const idx = Math.floor(Math.random() * sounds.length);
  playSound(sounds[idx]);
};
