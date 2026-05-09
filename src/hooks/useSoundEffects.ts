"use client";

import { useCallback, useMemo, useRef } from "react";

export function useSoundEffects() {
  const contextRef = useRef<AudioContext | null>(null);

  const playTone = useCallback((frequency: number, duration = 0.035, gain = 0.025) => {
    if (typeof window === "undefined") {
      return;
    }

    const AudioContextConstructor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) {
      return;
    }

    const context = contextRef.current ?? new AudioContextConstructor();
    contextRef.current = context;

    const oscillator = context.createOscillator();
    const volume = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    volume.gain.value = gain;
    oscillator.connect(volume);
    volume.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }, []);

  const keyClick = useCallback(() => playTone(420, 0.028, 0.018), [playTone]);
  const errorClick = useCallback(() => playTone(150, 0.045, 0.03), [playTone]);
  const matchFound = useCallback(() => playTone(720, 0.12, 0.035), [playTone]);
  const victory = useCallback(() => {
    playTone(620, 0.08, 0.035);
    window.setTimeout(() => playTone(920, 0.12, 0.035), 90);
  }, [playTone]);

  return useMemo(
    () => ({
      keyClick,
      errorClick,
      matchFound,
      victory
    }),
    [errorClick, keyClick, matchFound, victory]
  );
}
