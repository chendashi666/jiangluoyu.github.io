import { useRef, useEffect, useCallback } from "react";

let globalAudioRef: HTMLAudioElement | null = null;

export function useSharedAudio() {
  if (!globalAudioRef) {
    globalAudioRef = new Audio();
  }

  const audioRef = useRef(globalAudioRef);

  const setSrc = useCallback((src: string) => {
    if (audioRef.current.src !== src) {
      audioRef.current.src = src;
    }
  }, []);

  const play = useCallback((): Promise<void> => {
    return audioRef.current.play();
  }, []);

  const pause = useCallback(() => {
    audioRef.current.pause();
  }, []);

  const setOnEnded = useCallback((callback: (() => void) | null) => {
    audioRef.current.onended = callback;
  }, []);

  const setVolume = useCallback((volume: number) => {
    audioRef.current.volume = volume;
  }, []);

  return {
    audioRef,
    setSrc,
    play,
    pause,
    setOnEnded,
    setVolume,
  };
}
