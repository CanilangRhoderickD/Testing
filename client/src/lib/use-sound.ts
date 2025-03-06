import { useEffect, useRef } from "react";

const SOUND_EFFECTS = {
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  levelUp: "/sounds/level-up.mp3",
  achievement: "/sounds/achievement.mp3",
  click: "/sounds/click.mp3"
} as const;

type SoundEffect = keyof typeof SOUND_EFFECTS;

export function useSound() {
  const audioRef = useRef<{ [K in SoundEffect]?: HTMLAudioElement }>({});

  useEffect(() => {
    // Preload sounds
    Object.entries(SOUND_EFFECTS).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = "auto";
      audioRef.current[key as SoundEffect] = audio;
    });

    return () => {
      // Cleanup
      Object.values(audioRef.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  const play = (effect: SoundEffect) => {
    const audio = audioRef.current[effect];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  };

  return { play };
}
