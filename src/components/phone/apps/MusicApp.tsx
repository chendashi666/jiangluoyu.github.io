import { useEffect, useState, useCallback, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Plus, X, Music, Minimize2, AlertTriangle, Loader2, Search, CheckCircle2, FolderOpen, Upload } from "lucide-react";
import { useAppStore } from "@/store/app";
import { useSharedAudio } from "@/hooks/useSharedAudio";
import { detectPlatform, parseMusicShareUrl, type MusicPlatform } from "@/lib/musicParser";
import { LOCAL_SONGS } from "@/data/localSongs";

interface Props {
  onBack: () => void;
}

type AudioStatus = "idle" | "loading" | "playing" | "paused" | "error";

const PLATFORM_LABELS: Record<MusicPlatform, string> = {
  kugou: "酷狗音乐",
  netease: "网易云音乐",
  unknown: "",
};

/** 格式化秒数为 mm:ss */
function fmtTime(s: number): string {
  if (!isFinite(s) || s < 0) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function MusicApp({ onBack }: Props) {
  const songs = useAppStore((s) => s.songs);
  const addSong = useAppStore((s) => s.addSong);
  const removeSong = useAppStore((s) => s.removeSong);
  const musicPlaying = useAppStore((s) => s.musicPlaying);
  const setMusicPlaying = useAppStore((s) => s.setMusicPlaying);
  const musicCurrentIndex = useAppStore((s) => s.musicCurrentIndex);
  const setMusicCurrentIndex = useAppStore((s) => s.setMusicCurrentIndex);
  const setMusicFloating = useAppStore((s) => s.setMusicFloating);
  const setMusicSwitchNote = useAppStore((s) => s.setMusicSwitchNote);
  const themeId = useAppStore((s) => s.beauty.themeId);
  const isCuteMoe = themeId === "cute-moe";

  const { setSrc, play, pause, setOnEnded, setVolume, audioRef } = useSharedAudio();

  const [localVolume, setLocalVolume] = useState(0.7);
  const [showAddUrl, setShowAddUrl] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [parsing, setParsing] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState<MusicPlatform>("unknown");
  const [parseSuccess, setParseSuccess] = useState(false);

  // ---- 进度条状态 ----
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSong = songs[musicCurrentIndex];

  // ---- 进度条：监听全局 audio 事件 ----
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

  // 同步音量
  useEffect(() => { setVolume(localVolume); }, [localVolume, setVolume]);

  // 核心播放
  useEffect(() => {
    if (!currentSong?.url) { setAudioStatus("idle"); setCurrentTime(0); setDuration(0); return; }
    setAudioStatus("loading"); setErrorMessage("");
    setSrc(currentSong.url);
    if (musicPlaying) {
      play().then(() => setAudioStatus("playing")).catch((err) => {
        console.error(err); setAudioStatus("error");
        setErrorMessage("播放失败，请检查链接是否有效。"); setMusicPlaying(false);
      });
    } else { setAudioStatus("paused"); }
  }, [musicCurrentIndex, currentSong?.url, musicPlaying, setSrc, play, pause, setMusicPlaying]);

  // 挂载恢复
  useEffect(() => {
    if (currentSong?.url && musicPlaying) {
      setSrc(currentSong.url);
      play().then(() => setAudioStatus("playing")).catch(() => { setAudioStatus("error"); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnded = useCallback(() => {
    if (songs.length === 0) return;
    if (Math.random() < 0.02 && songs.length > 1) {
      let newIdx = musicCurrentIndex; while (newIdx === musicCurrentIndex) newIdx = Math.floor(Math.random() * songs.length);
      setMusicCurrentIndex(newIdx); setMusicPlaying(true);
      setMusicSwitchNote("宝宝，我换一首歌吧，这个好听"); return;
    }
    const nextIdx = musicCurrentIndex < songs.length - 1 ? musicCurrentIndex + 1 : 0;
    setMusicCurrentIndex(nextIdx); setMusicPlaying(true);
  }, [songs.length, musicCurrentIndex, setMusicCurrentIndex, setMusicPlaying, setMusicSwitchNote]);

  useEffect(() => { setOnEnded(handleEnded); }, [handleEnded, setOnEnded]);
  useEffect(() => { return () => { setOnEnded(() => {}); }; }, [setOnEnded]);

  // ---- 播放控制 ----
  const togglePlay = () => {
    if (!currentSong?.url) return;
    if (audioStatus === "error") { setAudioStatus("loading"); setErrorMessage(""); setSrc(currentSong.url); }
    const np = !musicPlaying; setMusicPlaying(np);
    if (np) { play().then(() => setAudioStatus("playing")).catch(() => { setAudioStatus("error"); setMusicPlaying(false); }); }
    else { pause(); setAudioStatus("paused"); }
  };
  const prevSong = () => { if (songs.length === 0) return; setErrorMessage(""); setMusicCurrentIndex(musicCurrentIndex > 0 ? musicCurrentIndex - 1 : songs.length - 1); setMusicPlaying(true); };
  const nextSong = () => { if (songs.length === 0) return; setErrorMessage(""); setMusicCurrentIndex(musicCurrentIndex < songs.length - 1 ? musicCurrentIndex + 1 : 0); setMusicPlaying(true); };

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

  // ---- URL 输入 ----
  const handleUrlChange = (value: string) => { setNewUrl(value); setErrorMessage(""); setParseSuccess(false); setDetectedPlatform(detectPlatform(value)); };
  const handleParseUrl = async () => {
    if (!newUrl.trim()) return; setParsing(true); setErrorMessage(""); setParseSuccess(false);
    try {
      const result = await parseMusicShareUrl(newUrl.trim());
      if (result) { setNewTitle(result.title); if (result.audioUrl && result.audioUrl !== newUrl.trim()) setNewUrl(result.audioUrl); setParseSuccess(true); }
      else setErrorMessage("解析失败：无法从此链接提取歌曲信息，请确认链接格式正确。");
    } catch { setErrorMessage("解析失败：网络错误，请稍后重试。"); }
    finally { setParsing(false); }
  };
  const handleAddSong = () => {
    const url = newUrl.trim(); const title = newTitle.trim();
    if (!url || !title) return;
    if (!/^(https?:\/\/|\/|blob:)/.test(url)) { setErrorMessage("请输入有效链接或以 / 开头的本地路径。"); return; }
    addSong(title, url);
    setNewUrl(""); setNewTitle(""); setShowAddUrl(false); setErrorMessage("");
    setDetectedPlatform("unknown"); setParseSuccess(false);
    if (songs.length === 0) setAudioStatus("loading");
  };
  const handleRemoveSong = (id: string) => {
    removeSong(id);
    if (currentSong?.id === id) { pause(); setMusicCurrentIndex(0); setMusicPlaying(false); setAudioStatus("idle"); setErrorMessage(""); }
  };

  // ---- 本地文件：选择预置歌曲 ----
  const handleSelectLocal = (title: string, url: string) => {
    setNewTitle(title); setNewUrl(url); setParseSuccess(true); setDetectedPlatform("unknown");
  };
  // ---- 本地文件：上传 ----
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "mp3" && ext !== "flac") { setErrorMessage("仅支持 .mp3 和 .flac 格式"); return; }
    const blobUrl = URL.createObjectURL(file);
    const title = file.name.replace(/\.(mp3|flac)$/i, "");
    setNewTitle(title); setNewUrl(blobUrl); setParseSuccess(true); setDetectedPlatform("unknown"); setErrorMessage("");
  };

  const handleMinimize = () => { setMusicFloating(true); onBack(); };

  return (
    <div className={`flex h-full flex-col ${isCuteMoe ? "cute-music-app" : ""}`}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: isCuteMoe ? "rgba(212,184,184,0.3)" : "var(--card-border)" }}>
        <button onClick={onBack} className="text-sm" style={{ color: isCuteMoe ? "#8BA8B8" : "var(--text-soft)" }}>返回</button>
        <span className="text-sm font-medium" style={{ color: isCuteMoe ? "#5F7A8C" : "var(--text)" }}>音乐</span>
        <button onClick={handleMinimize} className="flex items-center gap-1 text-xs" style={{ color: isCuteMoe ? "#8BA8B8" : "var(--text-soft)" }}><Minimize2 className="h-3.5 w-3.5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* 唱片封面 */}
        <div className="mb-3 rounded-3xl p-5 text-center cute-music-cover" style={{ background: isCuteMoe ? "rgba(255, 230, 235, 0.85)" : "linear-gradient(135deg, var(--accent) 20%, var(--accent) 10%)", border: isCuteMoe ? "1px solid rgba(212,184,184,0.35)" : "none" }}>
          <div className={`mb-3 flex h-20 w-20 items-center justify-center rounded-full mx-auto transition-transform duration-1000 ${audioStatus === "playing" ? "animate-spin-slow" : ""}`}
            style={{ background: isCuteMoe ? "rgba(255,255,255,0.82)" : "var(--card)", animationPlayState: audioStatus === "playing" ? "running" : "paused" }}>
            {audioStatus === "loading" ? <Loader2 className="h-10 w-10 animate-spin" style={{ color: isCuteMoe ? "#E88B8B" : "var(--accent)" }} />
            : audioStatus === "error" ? <AlertTriangle className="h-10 w-10" style={{ color: "#E74C3C" }} />
            : <Music className="h-10 w-10" style={{ color: isCuteMoe ? "#E88B8B" : "var(--accent)" }} />}
          </div>
          <div className="font-serif text-lg font-bold mb-0.5 truncate" style={{ color: isCuteMoe ? "#5F7A8C" : "var(--card)" }}>{currentSong?.title || "暂无歌曲"}</div>
          <div className="text-xs opacity-80" style={{ color: isCuteMoe ? "#8BA8B8" : "var(--card)" }}>
            {audioStatus === "loading" ? "加载中..." : audioStatus === "playing" ? "正在播放" : audioStatus === "paused" ? "已暂停" : audioStatus === "error" ? "播放失败" : "未播放"}
          </div>
        </div>

        {/* ---- 进度条 ---- */}
        <div className="mb-3 px-1">
          <div
            ref={progressBarRef}
            className="relative h-5 cursor-pointer flex items-center group"
            onMouseDown={onProgressMouseDown}
            onTouchStart={onProgressTouchStart}
          >
            {/* 轨道 */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center">
              <div className="h-1 w-full rounded-full" style={{ background: "color-mix(in srgb, var(--text) 15%, transparent)" }}>
                <div className="h-1 rounded-full transition-all duration-100" style={{ width: `${progressPct}%`, background: isCuteMoe ? "#E88B8B" : "var(--accent)" }} />
              </div>
            </div>
            {/* 拖拽圆点 */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progressPct}%`, background: isCuteMoe ? "#E88B8B" : "var(--accent)", boxShadow: "0 0 4px rgba(0,0,0,0.2)" }} />
          </div>
          <div className="flex justify-between mt-0.5 text-[10px]" style={{ color: "var(--text-soft)" }}>
            <span>{fmtTime(currentTime)}</span>
            <span>{duration > 0 ? fmtTime(duration) : "--:--"}</span>
          </div>
        </div>

        {/* 错误提示 */}
        {audioStatus === "error" && errorMessage && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed" style={{ color: "#C0392B" }}>
            <div className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /><div><div className="font-medium mb-0.5">播放失败</div><div>{errorMessage}</div></div></div>
          </div>
        )}

        {/* 音量 */}
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--text-soft)" }}>🔈</span>
          <input type="range" min="0" max="1" step="0.05" value={localVolume} onChange={(e) => setLocalVolume(parseFloat(e.target.value))}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, var(--accent) ${localVolume * 100}%, var(--card-border) ${localVolume * 100}%)`, accentColor: "var(--accent)" }} />
          <span className="text-xs" style={{ color: "var(--text-soft)" }}>🔊</span>
        </div>

        {/* 播放控制 */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button onClick={prevSong} disabled={songs.length === 0} className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-black/5 disabled:opacity-30" style={{ color: "var(--text)" }}><SkipBack className="h-4 w-4" /></button>
          <button onClick={togglePlay} disabled={!currentSong?.url}
            className="flex h-12 w-12 items-center justify-center rounded-full transition hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{ background: isCuteMoe ? "#E88B8B" : "var(--accent)", color: "var(--card)", boxShadow: isCuteMoe ? "0 4px 15px rgba(232,139,139,0.3)" : "0 4px 15px rgba(199,62,58,0.3)" }}>
            {audioStatus === "loading" ? <Loader2 className="h-6 w-6 animate-spin" /> : musicPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
          <button onClick={nextSong} disabled={songs.length === 0} className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-black/5 disabled:opacity-30" style={{ color: "var(--text)" }}><SkipForward className="h-4 w-4" /></button>
        </div>

        {/* 添加按钮 */}
        <div className="mb-3 text-center">
          <button onClick={() => setShowAddUrl(true)} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition hover:opacity-80"
            style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)", color: isCuteMoe ? "#E88B8B" : "var(--accent)" }}><Plus className="h-3 w-3" />添加歌曲</button>
        </div>

        {/* 歌单 */}
        <div className="space-y-1.5">
          {songs.length === 0 ? <div className="py-6 text-center text-xs" style={{ color: "var(--text-soft)" }}>暂无歌曲，点击上方添加</div>
          : songs.map((song, index) => (
            <div key={song.id} className={`flex items-center gap-2 rounded-xl border p-2.5 transition ${index === musicCurrentIndex ? "bg-black/5" : ""}`} style={{ borderColor: "var(--card-border)" }}>
              <button onClick={() => { setErrorMessage(""); setMusicCurrentIndex(index); setMusicPlaying(true); }}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-black/5 shrink-0" style={{ background: "var(--bg)" }}>
                {index === musicCurrentIndex && audioStatus === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "var(--accent)" }} />
                : index === musicCurrentIndex && musicPlaying ? <Pause className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                : <Play className="h-3.5 w-3.5" style={{ color: "var(--text-soft)" }} />}
              </button>
              <div className="flex-1 min-w-0"><div className="text-xs truncate" style={{ color: "var(--text)" }}>{song.title}</div></div>
              {index === musicCurrentIndex && audioStatus === "error" && <AlertTriangle className="h-3 w-3 shrink-0" style={{ color: "#E74C3C" }} />}
              <button onClick={() => handleRemoveSong(song.id)} className="flex h-5 w-5 items-center justify-center rounded-full transition hover:bg-red-50 shrink-0" style={{ color: "#E74C3C" }}><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* ============ 添加歌曲弹窗 ============ */}
      {showAddUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowAddUrl(false); setErrorMessage(""); setNewUrl(""); setNewTitle(""); setDetectedPlatform("unknown"); setParseSuccess(false); }}>
          <div className="w-[92%] max-w-sm rounded-2xl border p-4 max-h-[85vh] overflow-y-auto" style={{ borderColor: "var(--card-border)", background: "var(--card)" }} onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 font-serif text-base font-bold" style={{ color: "var(--text)" }}>添加歌曲</div>

            <div className="space-y-3">
              {/* ---- 线上链接 ---- */}
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-soft)" }}>粘贴分享链接或音频直链</label>
                <div className="relative">
                  <input value={newUrl} onChange={(e) => handleUrlChange(e.target.value)} placeholder="支持酷狗/网易云分享链接 &amp; 音频直链" disabled={parsing}
                    className="w-full rounded-xl border px-3 py-2.5 pr-20 text-sm focus:outline-none disabled:opacity-60"
                    style={{ borderColor: errorMessage ? "#E74C3C" : parseSuccess ? "#27AE60" : "var(--card-border)", background: "var(--bg)", color: "var(--text)" }} />
                  {detectedPlatform !== "unknown" && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: detectedPlatform === "kugou" ? "#E8F4FD" : "#FFF0F0", color: detectedPlatform === "kugou" ? "#2196F3" : "#E74C3C" }}>{PLATFORM_LABELS[detectedPlatform]}</span>
                  )}
                </div>
                {detectedPlatform !== "unknown" && !parseSuccess && (
                  <button onClick={handleParseUrl} disabled={parsing}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium transition hover:opacity-85 disabled:opacity-50"
                    style={{ background: detectedPlatform === "kugou" ? "#2196F3" : "#E74C3C", color: "#fff" }}>
                    {parsing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />解析中...</> : <><Search className="h-3.5 w-3.5" />智能解析 {PLATFORM_LABELS[detectedPlatform]} 链接</>}
                  </button>
                )}
                {parseSuccess && (
                  <div className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px]" style={{ background: "#E8F8F0", color: "#27AE60" }}><CheckCircle2 className="h-3.5 w-3.5" />解析成功，歌名和链接已自动填入</div>
                )}
              </div>

              {/* ---- 本地文件分隔 ---- */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px" style={{ background: "var(--card-border)" }} />
                <span className="text-[10px] font-medium" style={{ color: "var(--text-soft)" }}>本地文件</span>
                <div className="flex-1 h-px" style={{ background: "var(--card-border)" }} />
              </div>

              {/* 预置歌曲列表 */}
              {LOCAL_SONGS.length > 0 && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-medium" style={{ color: "var(--text-soft)" }}>📁 预置歌曲（点击选择）</label>
                  {LOCAL_SONGS.map((s, i) => (
                    <button key={i} onClick={() => handleSelectLocal(s.title, s.url)}
                      className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition hover:bg-black/5"
                      style={{ borderColor: "var(--card-border)", background: newUrl === s.url ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "var(--bg)" }}>
                      <FolderOpen className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-soft)" }} />
                      <span className="truncate" style={{ color: "var(--text)" }}>{s.title}</span>
                      <span className="ml-auto shrink-0 text-[10px]" style={{ color: "var(--text-soft)" }}>{s.url.split(".").pop()?.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* 上传本地文件 */}
              <div>
                <input ref={fileInputRef} type="file" accept=".mp3,.flac" onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 text-xs font-medium transition hover:bg-black/5"
                  style={{ borderColor: "var(--card-border)", color: "var(--text-soft)" }}>
                  <Upload className="h-3.5 w-3.5" />浏览本地文件（.mp3 / .flac）
                </button>
              </div>

              {/* 歌曲名称 */}
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-soft)" }}>歌曲名称</label>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} disabled={parsing}
                  placeholder={parseSuccess ? "已自动填入" : "手动输入或选择歌曲后自动填入"}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none disabled:opacity-60"
                  style={{ borderColor: parseSuccess ? "#27AE60" : "var(--card-border)", background: "var(--bg)", color: "var(--text)" }} />
              </div>

              {errorMessage && (
                <div className="rounded-lg bg-red-50 p-2.5 text-xs leading-relaxed" style={{ color: "#C0392B" }}>
                  <div className="flex items-start gap-1.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span>{errorMessage}</span></div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={() => { setShowAddUrl(false); setErrorMessage(""); setNewUrl(""); setNewTitle(""); setDetectedPlatform("unknown"); setParseSuccess(false); }}
                  className="flex-1 rounded-xl py-2.5 text-sm transition hover:bg-black/5" style={{ background: "var(--bg)", color: "var(--text)" }}>取消</button>
                <button onClick={handleAddSong} disabled={!newUrl.trim() || !newTitle.trim() || parsing}
                  className="flex-1 rounded-xl py-2.5 text-sm font-medium transition disabled:opacity-40"
                  style={{ background: "var(--accent)", color: "var(--card)" }}>添加</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
