import { useEffect, useState, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, X, Music, Minimize2 } from "lucide-react";
import { useAppStore } from "@/store/app";
import { useSharedAudio } from "@/hooks/useSharedAudio";

function fmtTime(s: number): string {
  if (!isFinite(s) || s < 0) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function MusicPlayerModal() {
  const musicFullScreen = useAppStore((s) => s.musicFullScreen);
  const setMusicFullScreen = useAppStore((s) => s.setMusicFullScreen);
  const setMusicFloating = useAppStore((s) => s.setMusicFloating);
  const songs = useAppStore((s) => s.songs);
  const musicPlaying = useAppStore((s) => s.musicPlaying);
  const setMusicPlaying = useAppStore((s) => s.setMusicPlaying);
  const musicCurrentIndex = useAppStore((s) => s.musicCurrentIndex);
  const setMusicCurrentIndex = useAppStore((s) => s.setMusicCurrentIndex);
  const themeId = useAppStore((s) => s.beauty.themeId);
  const isCuteMoe = themeId === "cute-moe";

  const { setSrc, play, pause, setOnEnded, audioRef } = useSharedAudio();
  const currentSong = songs[musicCurrentIndex];

  // ---- 进度条 ----
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    const onTime = () => { if (!seeking) setCurrentTime(audio.currentTime); };
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setCurrentTime(0);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, [audioRef, seeking]);

  useEffect(() => {
    if (!musicFullScreen) return; // 不可见时不操作共享音频
    if (currentSong?.url) { setSrc(currentSong.url); if (musicPlaying) play(); else pause(); }
  }, [musicCurrentIndex, currentSong?.url, musicPlaying, musicFullScreen, setSrc, play, pause]);

  useEffect(() => {
    const handleEnded = () => {
      if (songs.length === 0) return;
      const nextIdx = musicCurrentIndex < songs.length - 1 ? musicCurrentIndex + 1 : 0;
      setMusicCurrentIndex(nextIdx); setMusicPlaying(true);
    };
    setOnEnded(handleEnded);
  }, [musicCurrentIndex, songs.length, setMusicCurrentIndex, setMusicPlaying, setOnEnded]);

  const togglePlay = () => { if (!currentSong?.url) return; setMusicPlaying(!musicPlaying); };
  const prevSong = () => { if (songs.length === 0) return; setMusicCurrentIndex(musicCurrentIndex > 0 ? musicCurrentIndex - 1 : songs.length - 1); setMusicPlaying(true); };
  const nextSong = () => { if (songs.length === 0) return; setMusicCurrentIndex(musicCurrentIndex < songs.length - 1 ? musicCurrentIndex + 1 : 0); setMusicPlaying(true); };

  // ---- 进度条交互 ----
  const handleSeek = (clientX: number) => {
    const bar = progressBarRef.current; if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  };
  const onProgressMouseDown = (e: React.MouseEvent) => { e.preventDefault(); setSeeking(true); handleSeek(e.clientX); };
  const onProgressTouchStart = (e: React.TouchEvent) => { setSeeking(true); handleSeek(e.touches[0].clientX); };
  useEffect(() => {
    if (!seeking) return;
    const onMove = (e: MouseEvent) => handleSeek(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleSeek(e.touches[0].clientX);
    const onUp = () => setSeeking(false);
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove); window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove); window.removeEventListener("touchend", onUp);
    };
  }, [seeking]);
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleMinimize = () => { setMusicFullScreen(false); setMusicFloating(true); };
  const handleClose = () => { setMusicFullScreen(false); setMusicPlaying(false); };

  if (!musicFullScreen || !currentSong) return null;

  return (
    <div className={`fixed inset-0 z-[300] flex flex-col ${isCuteMoe ? "cute-music-player-fullscreen" : ""}`}
      style={{ background: isCuteMoe ? "transparent" : "var(--bg-deep)" }}>
      {/* 顶部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: isCuteMoe ? "rgba(212,184,184,0.3)" : "var(--card-border)" }}>
        <button onClick={handleMinimize} className="flex items-center gap-1 text-sm transition hover:opacity-80" style={{ color: isCuteMoe ? "#8BA8B8" : "var(--text-soft)" }}><Minimize2 className="h-4 w-4" />缩小</button>
        <span className="text-sm font-medium" style={{ color: isCuteMoe ? "#5F7A8C" : "var(--text)" }}>正在播放</span>
        <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/10" style={{ color: isCuteMoe ? "#8BA8B8" : "var(--text-soft)" }}><X className="h-4 w-4" /></button>
      </div>

      {/* 中间 */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="mb-6 flex h-40 w-40 items-center justify-center rounded-full cute-music-disc"
          style={{ background: isCuteMoe ? "rgba(255,255,255,0.82)" : "color-mix(in srgb, var(--accent) 15%, transparent)", boxShadow: isCuteMoe ? "0 4px 12px rgba(180,120,140,0.2)" : "none" }}>
          <Music className="h-20 w-20" style={{ color: isCuteMoe ? "#E88B8B" : "var(--accent)" }} />
        </div>
        <div className="mb-1 text-center text-xl font-bold" style={{ color: isCuteMoe ? "#5F7A8C" : "var(--text)" }}>{currentSong.title}</div>
        <div className="text-sm mb-6" style={{ color: isCuteMoe ? "#8BA8B8" : "var(--text-soft)" }}>{musicPlaying ? "播放中" : "已暂停"}</div>

        {/* ---- 进度条 ---- */}
        <div className="w-full max-w-xs mb-2">
          <div ref={progressBarRef} className="relative h-6 cursor-pointer flex items-center group"
            onMouseDown={onProgressMouseDown} onTouchStart={onProgressTouchStart}>
            <div className="absolute inset-y-0 left-0 right-0 flex items-center">
              <div className="h-1.5 w-full rounded-full" style={{ background: "color-mix(in srgb, var(--text) 15%, transparent)" }}>
                <div className="h-1.5 rounded-full transition-all duration-100" style={{ width: `${progressPct}%`, background: isCuteMoe ? "#E88B8B" : "var(--accent)" }} />
              </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progressPct}%`, background: isCuteMoe ? "#E88B8B" : "var(--accent)", boxShadow: "0 0 6px rgba(0,0,0,0.25)" }} />
          </div>
          <div className="flex justify-between mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
            <span>{fmtTime(currentTime)}</span>
            <span>{duration > 0 ? fmtTime(duration) : "--:--"}</span>
          </div>
        </div>
      </div>

      {/* 控制 */}
      <div className="flex items-center justify-center gap-6 px-6 pb-6">
        <button onClick={prevSong} disabled={songs.length === 0} className="flex h-14 w-14 items-center justify-center rounded-full transition hover:bg-black/5 disabled:opacity-40"
          style={{ background: "var(--card)", color: "var(--text)" }}><SkipBack className="h-6 w-6" /></button>
        <button onClick={togglePlay} disabled={!currentSong?.url}
          className="flex h-20 w-20 items-center justify-center rounded-full transition hover:scale-105 active:scale-95 disabled:opacity-40"
          style={{ background: isCuteMoe ? "#E88B8B" : "var(--accent)", color: "var(--card)", boxShadow: isCuteMoe ? "0 4px 15px rgba(232,139,139,0.3)" : "0 4px 15px rgba(199,62,58,0.3)" }}>
          {musicPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
        </button>
        <button onClick={nextSong} disabled={songs.length === 0} className="flex h-14 w-14 items-center justify-center rounded-full transition hover:bg-black/5 disabled:opacity-40"
          style={{ background: "var(--card)", color: "var(--text)" }}><SkipForward className="h-6 w-6" /></button>
      </div>

      {/* 播放列表 */}
      <div className="max-h-[30%] overflow-y-auto border-t px-4 py-3" style={{ borderColor: "var(--card-border)" }}>
        <div className="space-y-2">
          {songs.map((song, index) => (
            <button key={song.id} onClick={() => { setMusicCurrentIndex(index); setMusicPlaying(true); }}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 transition ${index === musicCurrentIndex ? "" : "hover:bg-black/5"}`}
              style={{ borderColor: "var(--card-border)", background: index === musicCurrentIndex ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "var(--card)" }}>
              {index === musicCurrentIndex && musicPlaying ? <Pause className="h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
              : <Play className="h-4 w-4 shrink-0" style={{ color: "var(--text-soft)" }} />}
              <div className="flex-1 text-left"><div className="text-sm truncate" style={{ color: "var(--text)" }}>{song.title}</div></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

