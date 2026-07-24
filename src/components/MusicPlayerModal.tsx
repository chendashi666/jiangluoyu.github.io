import { useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, X, Music, Minimize2 } from "lucide-react";
import { useAppStore } from "@/store/app";
import { useSharedAudio } from "@/hooks/useSharedAudio";

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

  const { setSrc, play, pause, setOnEnded } = useSharedAudio();
  const currentSong = songs[musicCurrentIndex];

  useEffect(() => {
    if (currentSong?.url) {
      setSrc(currentSong.url);
      if (musicPlaying) {
        play();
      } else {
        pause();
      }
    }
  }, [musicCurrentIndex, currentSong?.url, musicPlaying, setSrc, play, pause]);

  useEffect(() => {
    const handleEnded = () => {
      if (songs.length === 0) return;
      const nextIdx = musicCurrentIndex < songs.length - 1 ? musicCurrentIndex + 1 : 0;
      setMusicCurrentIndex(nextIdx);
      setMusicPlaying(true);
    };
    setOnEnded(handleEnded);
  }, [musicCurrentIndex, songs.length, setMusicCurrentIndex, setMusicPlaying, setOnEnded]);

  const togglePlay = () => {
    if (!currentSong?.url) return;
    setMusicPlaying(!musicPlaying);
  };

  const prevSong = () => {
    if (songs.length === 0) return;
    const prevIdx = musicCurrentIndex > 0 ? musicCurrentIndex - 1 : songs.length - 1;
    setMusicCurrentIndex(prevIdx);
    setMusicPlaying(true);
  };

  const nextSong = () => {
    if (songs.length === 0) return;
    const nextIdx = musicCurrentIndex < songs.length - 1 ? musicCurrentIndex + 1 : 0;
    setMusicCurrentIndex(nextIdx);
    setMusicPlaying(true);
  };

  const handleMinimize = () => {
    setMusicFullScreen(false);
    setMusicFloating(true);
  };

  const handleClose = () => {
    setMusicFullScreen(false);
    setMusicPlaying(false);
  };

  if (!musicFullScreen || !currentSong) return null;

  return (
    <div
      className={`fixed inset-0 z-[300] flex flex-col ${isCuteMoe ? "cute-music-player-fullscreen" : ""}`}
      style={{ background: isCuteMoe ? "transparent" : "var(--bg-deep)" }}
    >

      {/* 顶部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: isCuteMoe ? "rgba(212,184,184,0.3)" : "var(--card-border)" }}>
        <button
          onClick={handleMinimize}
          className="flex items-center gap-1 text-sm transition hover:opacity-80"
          style={{ color: isCuteMoe ? "#8BA8B8" : "var(--text-soft)" }}
        >
          <Minimize2 className="h-4 w-4" />
          缩小
        </button>
        <span className="text-sm font-medium" style={{ color: isCuteMoe ? "#5F7A8C" : "var(--text)" }}>正在播放</span>
        <button
          onClick={handleClose}
          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/10"
          style={{ color: isCuteMoe ? "#8BA8B8" : "var(--text-soft)" }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 中间 */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div
          className="mb-8 flex h-40 w-40 items-center justify-center rounded-full cute-music-disc"
          style={{
            background: isCuteMoe
              ? "rgba(255, 255, 255, 0.82)"
              : "color-mix(in srgb, var(--accent) 15%, transparent)",
            boxShadow: isCuteMoe ? "0 4px 12px rgba(180, 120, 140, 0.2)" : "none",
          }}
        >
          <Music className="h-20 w-20" style={{ color: isCuteMoe ? "#E88B8B" : "var(--accent)" }} />
        </div>
        <div className="mb-2 text-center text-xl font-bold" style={{ color: isCuteMoe ? "#5F7A8C" : "var(--text)" }}>
          {currentSong.title}
        </div>
        <div className="text-sm" style={{ color: isCuteMoe ? "#8BA8B8" : "var(--text-soft)" }}>
          {musicPlaying ? "播放中" : "已暂停"}
        </div>
      </div>

      {/* 控制 */}
      <div className="flex items-center justify-center gap-6 px-6 pb-6">
        <button
          onClick={prevSong}
          disabled={songs.length === 0}
          className="flex h-14 w-14 items-center justify-center rounded-full transition hover:bg-black/5 disabled:opacity-40"
          style={{ background: "var(--card)", color: "var(--text)" }}
        >
          <SkipBack className="h-6 w-6" />
        </button>
        <button
          onClick={togglePlay}
          disabled={!currentSong?.url}
          className="flex h-20 w-20 items-center justify-center rounded-full transition hover:scale-105 active:scale-95 disabled:opacity-40"
          style={{
            background: isCuteMoe ? "#E88B8B" : "var(--accent)",
            color: "var(--card)",
            boxShadow: isCuteMoe
              ? "0 4px 15px rgba(232, 139, 139, 0.3)"
              : "0 4px 15px rgba(199, 62, 58, 0.3)",
          }}
        >
          {musicPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
        </button>
        <button
          onClick={nextSong}
          disabled={songs.length === 0}
          className="flex h-14 w-14 items-center justify-center rounded-full transition hover:bg-black/5 disabled:opacity-40"
          style={{ background: "var(--card)", color: "var(--text)" }}
        >
          <SkipForward className="h-6 w-6" />
        </button>
      </div>

      {/* 播放列表 */}
      <div className="max-h-[30%] overflow-y-auto border-t px-4 py-3" style={{ borderColor: "var(--card-border)" }}>
        <div className="space-y-2">
          {songs.map((song, index) => (
            <button
              key={song.id}
              onClick={() => {
                setMusicCurrentIndex(index);
                setMusicPlaying(true);
              }}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 transition ${
                index === musicCurrentIndex ? "" : "hover:bg-black/5"
              }`}
              style={{
                borderColor: "var(--card-border)",
                background:
                  index === musicCurrentIndex
                    ? "color-mix(in srgb, var(--accent) 8%, transparent)"
                    : "var(--card)",
              }}
            >
              {index === musicCurrentIndex && musicPlaying ? (
                <Pause className="h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
              ) : (
                <Play className="h-4 w-4 shrink-0" style={{ color: "var(--text-soft)" }} />
              )}
              <div className="flex-1 text-left">
                <div className="text-sm truncate" style={{ color: "var(--text)" }}>
                  {song.title}
                </div>
                <div className="text-xs truncate opacity-60" style={{ color: "var(--text-soft)" }}>
                  {song.url.substring(0, 30)}
                  {song.url.length > 30 ? "..." : ""}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
