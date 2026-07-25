import { useRef, useCallback } from "react";

let globalAudioRef: HTMLAudioElement | null = null;

export function useSharedAudio() {
  if (!globalAudioRef) {
    globalAudioRef = new Audio();
  }

  const audioRef = useRef(globalAudioRef);

  /** 设置音频源。自动归一化 URL 后再比较，避免因编码/绝对路径差异导致重复加载。 */
  const setSrc = useCallback((src: string) => {
    if (!src) return;
    const currentSrc = audioRef.current.src;
    // 空/第一次设置：直接赋值
    if (!currentSrc || currentSrc === window.location.href) {
      audioRef.current.src = src;
      return;
    }
    // 归一化比较：都转成完整 URL href
    try {
      const cur = new URL(currentSrc);
      const next = new URL(src, window.location.href);
      if (cur.href !== next.href) {
        audioRef.current.src = src;
      }
    } catch {
      // 解析失败则直接赋值
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
