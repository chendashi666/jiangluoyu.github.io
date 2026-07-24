import { useEffect, useState, useRef } from "react";
import { Play, Pause, SkipForward, X, Music, GripVertical } from "lucide-react";
import { useAppStore } from "@/store/app";
import { useSharedAudio } from "@/hooks/useSharedAudio";

export default function FloatingMusic() {
  const musicFloating = useAppStore((s) => s.musicFloating);
  const setMusicFloating = useAppStore((s) => s.setMusicFloating);
  const songs = useAppStore((s) => s.songs);
  const musicPlaying = useAppStore((s) => s.musicPlaying);
  const setMusicPlaying = useAppStore((s) => s.setMusicPlaying);
  const musicCurrentIndex = useAppStore((s) => s.musicCurrentIndex);
  const setMusicCurrentIndex = useAppStore((s) => s.setMusicCurrentIndex);
  const musicSwitchNote = useAppStore((s) => s.musicSwitchNote);
  const setMusicSwitchNote = useAppStore((s) => s.setMusicSwitchNote);
  const musicFullScreen = useAppStore((s) => s.musicFullScreen);
  const setMusicFullScreen = useAppStore((s) => s.setMusicFullScreen);

  const { setSrc, play, pause, setOnEnded } = useSharedAudio();
  const currentSong = songs[musicCurrentIndex];

  const [pos, setPos] = useState(() => ({
    x: typeof window !== "undefined" ? window.innerWidth - 260 : 100,
    y: typeof window !== "undefined" ? window.innerHeight - 80 : 100,
  }));
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);

  useEffect(() => {
    if (currentSong?.url) {
      setSrc(currentSong.url);
      if (musicPlaying) {
        play();
      } else {
        pause();
      }
    }
  }, [musicCurrentIndex, currentSong?.url, musicPlaying, musicFloating, setSrc, play, pause]);

  useEffect(() => {
    const handleEnded = () => {
      if (songs.length === 0) return;
      if (Math.random() < 0.02 && songs.length > 1) {
        let newIdx = musicCurrentIndex;
        while (newIdx === musicCurrentIndex) {
          newIdx = Math.floor(Math.random() * songs.length);
        }
        setMusicCurrentIndex(newIdx);
        setMusicPlaying(true);
        setMusicSwitchNote("宝宝，我换一首歌吧，这个好听");
        return;
      }
      const nextIdx = musicCurrentIndex < songs.length - 1 ? musicCurrentIndex + 1 : 0;
      setMusicCurrentIndex(nextIdx);
      setMusicPlaying(true);
    };
    setOnEnded(handleEnded);
  }, [musicCurrentIndex, songs.length, setMusicCurrentIndex, setMusicPlaying, setMusicSwitchNote, setOnEnded]);

  const startDrag = (clientX: number, clientY: number) => {
    draggingRef.current = true;
    movedRef.current = false;
    offsetRef.current = {
      x: clientX - pos.x,
      y: clientY - pos.y,
    };
  };

  const onDrag = (clientX: number, clientY: number) => {
    if (!draggingRef.current) return;
    movedRef.current = true;
    const width = 250;
    const height = 52;
    setPos({
      x: Math.max(8, Math.min(window.innerWidth - width - 8, clientX - offsetRef.current.x)),
      y: Math.max(8, Math.min(window.innerHeight - height - 8, clientY - offsetRef.current.y)),
    });
  };

  const endDrag = () => {
    draggingRef.current = false;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => onDrag(e.clientX, e.clientY);
    const handleMouseUp = () => endDrag();
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => endDrag();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const handleClick = () => {
    if (movedRef.current) return;
    setMusicFloating(false);
    setMusicFullScreen(true);
  };

  if (!musicFloating || !currentSong) return null;

  return (
    <>
      {musicSwitchNote && (
        <div
          className="fixed z-[210] flex items-center justify-center"
          style={{ top: pos.y - 70, left: Math.max(0, pos.x) }}
        >
          <div
            className="animate-bubbleIn rounded-2xl border px-4 py-3 shadow-xl"
            style={{
              background: "var(--card)",
              borderColor: "var(--accent)",
              maxWidth: "280px",
            }}
          >
            <div className="mb-1 text-xs font-medium" style={{ color: "var(--accent)" }}>
              🎵 切歌提示
            </div>
            <div className="text-sm" style={{ color: "var(--text)" }}>
              {musicSwitchNote}
            </div>
            <button
              onClick={() => setMusicSwitchNote(null)}
              className="mt-2 w-full rounded-lg py-1.5 text-xs font-medium"
              style={{ background: "var(--accent)", color: "var(--card)" }}
            >
              好的
            </button>
          </div>
        </div>
      )}

      <div
        className="fixed z-[200] select-none"
        style={{ left: pos.x, top: pos.y }}
      >
        <div
          className="flex items-center gap-1.5 rounded-2xl border px-2 py-1.5 shadow-xl cursor-default transition hover:shadow-2xl"
          style={{
            background: "var(--card)",
            borderColor: "var(--card-border)",
          }}
        >
          <div
            className="flex h-8 w-6 shrink-0 items-center justify-center rounded-lg cursor-grab active:cursor-grabbing hover:bg-black/5"
            style={{ color: "var(--text-soft)" }}
            onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
            onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
            title="拖动移动"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg cursor-pointer"
            style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)" }}
            onClick={handleClick}
            title="点击打开手机"
          >
            <Music className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
          </div>

          <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
            <div className="truncate text-xs font-medium" style={{ color: "var(--text)" }}>
              {currentSong?.title || "无歌曲"}
            </div>
            <div className="text-[10px]" style={{ color: "var(--text-soft)" }}>
              {musicPlaying ? "播放中" : "已暂停"}
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setMusicPlaying(!musicPlaying); }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition hover:bg-black/5"
            style={{ color: "var(--accent)" }}
          >
            {musicPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (songs.length === 0) return;
              const nextIdx = musicCurrentIndex < songs.length - 1 ? musicCurrentIndex + 1 : 0;
              setMusicCurrentIndex(nextIdx);
              setMusicPlaying(true);
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition hover:bg-black/5"
            style={{ color: "var(--text-soft)" }}
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMusicFloating(false);
              setMusicPlaying(false);
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition hover:bg-red-50"
            style={{ color: "#E74C3C" }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
