import { useState, useMemo, useCallback, useRef } from "react";
import { X, Book, Library, Mail, Send } from "lucide-react";
import { useAppStore } from "@/store/app";
import BottleCardLibrary from "@/components/phone/apps/BottleCardLibrary";
import BottleDiary from "@/components/phone/apps/BottleDiary";
import BottleLetterWriter from "@/components/phone/apps/BottleLetterWriter";

const BASE = import.meta.env.BASE_URL;
const img = (name: string) => `${BASE}driftbottle/${name}`;

function formatRemainingTime(ms: number): string {
  if (ms <= 0) return "即将";
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) return `${hours}小时${minutes}分钟`;
  return `${minutes}分钟`;
}

interface StarItem {
  id: string;
  x: number;
  y: number;
  size: number;
}

interface OceanItem {
  id: string;
  x: number;
  y: number;
  type: "coral" | "pearl" | "shell" | "wave";
}

function generateNonOverlapping(count: number, areaWidth: number, areaHeight: number, minDist: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  let attempts = 0;
  const maxAttempts = count * 30;
  while (positions.length < count && attempts < maxAttempts) {
    attempts++;
    const x = Math.random() * (areaWidth - 40) + 20;
    const y = Math.random() * (areaHeight - 40) + 20;
    const ok = positions.every((p) => Math.hypot(p.x - x, p.y - y) >= minDist);
    if (ok) positions.push({ x, y });
  }
  while (positions.length < count) {
    positions.push({
      x: Math.random() * (areaWidth - 40) + 20,
      y: Math.random() * (areaHeight - 40) + 20,
    });
  }
  return positions;
}

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getCurrentSlot(): "morning" | "noon" | "evening" {
  const h = new Date().getHours();
  if (h < 10) return "morning";
  if (h < 15) return "noon";
  return "evening";
}

function getNextSlotTime(): string {
  const h = new Date().getHours();
  if (h < 10) return "10:00";
  if (h < 15) return "15:00";
  return "明天 06:00";
}

export default function DriftBottleModal() {
  const isOpen = useAppStore((s) => s.driftBottleOpen);
  const onClose = () => useAppStore.getState().setDriftBottleOpen(false);
  const contactId = useAppStore((s) => s.getActiveBottleContactId());

  const bottleData = useAppStore((s) => contactId ? s.bottleData[contactId] : null);
  const bottleNoteCards = bottleData?.noteCards || [];
  const bottleWhisperCards = bottleData?.whisperCards || [];
  const bottleStarPicks = bottleData?.starPicks || {};
  const bottleLetters = bottleData?.letters || [];
  const bottleDiary = bottleData?.diary || [];
  const pickBottleStar = useAppStore((s) => s.pickBottleStar);
  const pickBottleOcean = useAppStore((s) => s.pickBottleOcean);
  const replyBottleOcean = useAppStore((s) => s.replyBottleOcean);
  const receiveBottleOceanReply = useAppStore((s) => s.receiveBottleOceanReply);

  const [view, setView] = useState<"main" | "library" | "diary" | "letters">("main");
  const [showLetter, setShowLetter] = useState(false);
  const [pickedNote, setPickedNote] = useState<string | null>(null);
  const [pickedWhisper, setPickedWhisper] = useState<string | null>(null);
  const [pickedWhisperId, setPickedWhisperId] = useState<string | null>(null);
  const [whisperReply, setWhisperReply] = useState("");
  const [whisperReplied, setWhisperReplied] = useState(false);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedLetters, setExpandedLetters] = useState<Set<string>>(new Set());
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const toggleLetterExpand = (id: string) => {
    setExpandedLetters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleReplyExpand = (id: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const today = getTodayKey();
  const todayPicks = bottleStarPicks[today] || { morning: false, noon: false, evening: false };

  const starCountToday = (todayPicks.morning ? 1 : 0) + (todayPicks.noon ? 1 : 0) + (todayPicks.evening ? 1 : 0);
  const maxStarCount = 3;

  const oceanCountToday = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return bottleDiary.filter(
      (d) => d.type === "ocean" && d.timestamp >= todayStart.getTime()
    ).length;
  }, [bottleDiary]);

  const availableStars = useMemo(() => {
    const slot = getCurrentSlot();
    let count = 0;
    if (slot === "morning" && !todayPicks.morning) count++;
    if ((slot === "noon" || slot === "evening") && !todayPicks.morning) count++;
    if (slot === "noon" && !todayPicks.noon) count++;
    if (slot === "evening" && !todayPicks.noon) count++;
    if (slot === "evening" && !todayPicks.evening) count++;
    return Math.min(count, 3);
  }, [todayPicks]);

  const stars = useMemo<StarItem[]>(() => {
    const count = Math.max(0, Math.min(availableStars, 4));
    const positions = generateNonOverlapping(count, 100, 100, 30);
    return positions.map((p, i) => ({
      id: `star_${refreshKey}_${i}`,
      x: p.x,
      y: p.y * 0.4 + 8,
      size: 44 + Math.random() * 20,
    }));
  }, [availableStars, refreshKey]);

  const oceanItems = useMemo<OceanItem[]>(() => {
    const count = Math.floor(Math.random() * 5) + 2;
    const positions = generateNonOverlapping(count, 100, 100, 25);
    const types: OceanItem["type"][] = ["coral", "pearl", "shell", "wave"];
    return positions.map((p, i) => ({
      id: `ocean_${refreshKey}_${i}`,
      x: p.x,
      y: 72 + p.y * 0.28,
      type: types[Math.floor(Math.random() * types.length)],
    }));
  }, [refreshKey]);

  const oceanImages: Record<OceanItem["type"], string> = {
    coral: img("coral.png"),
    pearl: img("pearl.png"),
    shell: img("shell.png"),
    wave: img("wave.png"),
  };

  const handleStarClick = (starId: string) => {
    if (!contactId || bottleNoteCards.length === 0) return;
    const card = bottleNoteCards[Math.floor(Math.random() * bottleNoteCards.length)];
    pickBottleStar(contactId, card.content);
    setPickedNote(card.content);

    const slot = getCurrentSlot();
    const newPicks = { ...todayPicks };
    if (slot === "morning" && !newPicks.morning) newPicks.morning = true;
    else if (slot === "noon" && !newPicks.noon) newPicks.noon = true;
    else if (slot === "evening" && !newPicks.evening) newPicks.evening = true;
    else {
      if (!newPicks.morning) newPicks.morning = true;
      else if (!newPicks.noon) newPicks.noon = true;
      else if (!newPicks.evening) newPicks.evening = true;
    }
    useAppStore.setState((s) => {
      const data = { ...s.bottleData };
      const bd = data[contactId] || { noteCards: [], whisperCards: [], replyCards: [], diary: [], letters: [], starPicks: {} };
      data[contactId] = { ...bd, starPicks: { ...bd.starPicks, [today]: newPicks } };
      return { bottleData: data };
    });
  };

  const handleOceanClick = (item: OceanItem) => {
    if (!contactId || bottleWhisperCards.length === 0) return;
    const card = bottleWhisperCards[Math.floor(Math.random() * bottleWhisperCards.length)];
    const id = pickBottleOcean(contactId, card.content);
    setPickedWhisper(card.content);
    setPickedWhisperId(id);
    setWhisperReply("");
    setWhisperReplied(false);
    setTimeout(() => {
      replyInputRef.current?.focus();
    }, 300);
  };

  const handleWhisperReply = () => {
    if (!contactId || !pickedWhisperId || !whisperReply.trim()) return;
    replyBottleOcean(contactId, pickedWhisperId, whisperReply.trim());
    setWhisperReplied(true);
  };

  const closeWhisper = () => {
    setPickedWhisper(null);
    setPickedWhisperId(null);
    setWhisperReply("");
    setWhisperReplied(false);
    setRefreshKey((k) => k + 1);
  };

  const handleEnvelopeClick = () => {
    setShowLetter(true);
  };

  const pendingLetters = bottleLetters.filter((l) => !l.receivedAt);
  const receivedLetters = bottleLetters.filter((l) => l.receivedAt && !l.replyAt);
  const repliedLetters = bottleLetters.filter((l) => l.replyAt);

  if (!isOpen) return null;

  if (view === "library") {
    return (
      <div className="fixed inset-0 z-[300] overflow-auto" style={{ background: "linear-gradient(180deg, #E8F4FC 0%, #D0E8F5 100%)" }}>
        <div className="mx-auto max-w-md">
          <BottleCardLibrary onBack={() => setView("main")} contactId={contactId} />
        </div>
      </div>
    );
  }
  if (view === "diary") {
    return (
      <div className="fixed inset-0 z-[300] overflow-auto" style={{ background: "linear-gradient(180deg, #E8F4FC 0%, #D0E8F5 100%)" }}>
        <div className="mx-auto max-w-md">
          <BottleDiary onBack={() => setView("main")} contactId={contactId} />
        </div>
      </div>
    );
  }
  if (showLetter) {
    return <BottleLetterWriter onClose={() => setShowLetter(false)} contactId={contactId} />;
  }

  const allStarsDone = starCountToday >= maxStarCount;
  const nextSlotTime = getNextSlotTime();

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${img("bg.jpg")})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(26,58,107,0.15) 0%, rgba(26,58,107,0.05) 40%, rgba(26,58,107,0.25) 100%)" }} />

      <div className="pointer-events-none absolute top-0 left-0 right-0 z-20 px-5 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/40 bg-white/20 backdrop-blur-md">
              <span className="text-2xl">⭐</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg" style={{ fontFamily: "'Songti SC', 'STSong', serif" }}>
                星海漂流瓶
              </h1>
              <p className="mt-0.5 text-sm text-white/80 drop-shadow">
                点击星星与海洋小物，拾起给你的讯息
              </p>
            </div>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => setView("letters")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/20 backdrop-blur-sm transition hover:bg-white/30 active:scale-95"
              title="信件"
            >
              <Mail className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => setView("diary")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/20 backdrop-blur-sm transition hover:bg-white/30 active:scale-95"
              title="日记本"
            >
              <Book className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => setView("library")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/20 backdrop-blur-sm transition hover:bg-white/30 active:scale-95"
              title="字卡库"
            >
              <Library className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/20 backdrop-blur-sm transition hover:bg-white/30 active:scale-95"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        <div className="pointer-events-auto mt-4 flex items-center gap-3 rounded-full border border-white/30 bg-white/20 px-4 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <span className="text-sm font-medium text-white">
              今日 <span className="text-yellow-300 font-bold">{starCountToday}</span> / {maxStarCount}
            </span>
          </div>
          <div className="h-4 w-px bg-white/30" />
          <div className="flex items-center gap-2">
            <span className="text-lg">🌊</span>
            <span className="text-sm font-medium text-white">
              海 今日 <span className="text-cyan-300 font-bold">{oceanCountToday}</span> 个
            </span>
          </div>
        </div>
      </div>

      <div className="absolute top-28 left-0 right-0 z-40" style={{ height: "30%", pointerEvents: "none" }}>
        {stars.map((star) => (
          <button
            key={star.id}
            onClick={() => handleStarClick(star.id)}
            className="absolute animate-twinkle transition-transform hover:scale-125 active:scale-90 cursor-pointer"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              transform: "translate(-50%, -50%)",
              pointerEvents: "auto",
              zIndex: 50,
            }}
          >
            <img src={img("star.png")} alt="star" className="h-full w-full object-contain drop-shadow-[0_0_8px_rgba(255,230,100,0.8)]" />
          </button>
        ))}
      </div>

      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <button
          onClick={handleEnvelopeClick}
          className="group transition-transform hover:scale-110 active:scale-95"
          title="写信塞入漂流瓶"
        >
          <img src={img("envelope.png")} alt="envelope" className="h-28 w-28 object-contain drop-shadow-2xl transition group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
          <div className="mt-2 text-center text-sm font-medium text-white drop-shadow-lg">
            点击写信，让漂流瓶带走
          </div>
        </button>

      </div>

      <div className="absolute bottom-24 left-0 right-0 z-30" style={{ height: "25%", pointerEvents: "none" }}>
        {oceanItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleOceanClick(item)}
            className="absolute transition-transform hover:scale-125 active:scale-90 cursor-pointer"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: 48,
              height: 48,
              transform: "translate(-50%, -50%)",
              pointerEvents: "auto",
              zIndex: 40,
            }}
          >
            <img src={oceanImages[item.type]} alt={item.type} className="h-full w-full object-contain drop-shadow-lg" />
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-20 px-5">
        <div className="pointer-events-auto flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-5 py-2.5 backdrop-blur-md">
            {allStarsDone ? (
              <span className="text-sm text-white/90">今日已收集完毕，明天再来吧</span>
            ) : (
              <span className="text-sm text-white/90">
                下一段星星 {nextSlotTime} 开启 · 今日已拾起 {oceanCountToday} 个海洋小物
              </span>
            )}
          </div>
        </div>
      </div>

      {pickedNote && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => {
            setPickedNote(null);
            setRefreshKey((k) => k + 1);
          }}
        >
          <div className="w-[min(340px,85%)] animate-popIn rounded-2xl bg-white/95 p-6 shadow-2xl backdrop-blur">
            <div className="mb-2 text-center text-3xl">⭐</div>
            <div className="text-center text-base font-medium leading-relaxed" style={{ color: "#1a3a6b", fontFamily: "'Songti SC', serif" }}>
              {pickedNote}
            </div>
            <div className="mt-4 text-center text-xs text-gray-400">点击任意处关闭</div>
          </div>
        </div>
      )}

      {pickedWhisper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeWhisper}>
          <div
            className="w-[min(380px,100%)] animate-popIn rounded-2xl bg-white/95 p-6 shadow-2xl backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 text-center text-4xl">🐚</div>
            <div className="text-center text-base leading-relaxed" style={{ color: "#1a3a6b", fontFamily: "'Kaiti SC', serif" }}>
              {pickedWhisper}
            </div>

            {!whisperReplied ? (
              <div className="mt-5">
                <textarea
                  ref={replyInputRef}
                  value={whisperReply}
                  onChange={(e) => setWhisperReply(e.target.value)}
                  placeholder="写下你的回复..."
                  className="w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-blue-400"
                  style={{ borderColor: "rgba(26,58,107,0.2)", color: "#1a3a6b", minHeight: "80px" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleWhisperReply();
                    }
                  }}
                />
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={closeWhisper}
                    className="rounded-full px-4 py-2 text-sm"
                    style={{ color: "#888" }}
                  >
                    稍后再说
                  </button>
                  <button
                    onClick={handleWhisperReply}
                    disabled={!whisperReply.trim()}
                    className="flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium text-white shadow-md transition active:scale-95 disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #3A7CA5 0%, #1a3a6b 100%)" }}
                  >
                    <Send className="h-4 w-4" />
                    回复
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 text-center">
                <div className="inline-block rounded-xl bg-blue-50 px-4 py-2 text-sm" style={{ color: "#1a3a6b" }}>
                  ✅ 已回复，TA 收到后会回你的
                </div>
                {pickedWhisperId && bottleData?.diary?.find((d) => d.id === pickedWhisperId)?.expectedHerReplyAt && (
                  <div className="mt-2 text-xs" style={{ color: "#666" }}>
                    预计还有 {formatRemainingTime((bottleData?.diary?.find((d) => d.id === pickedWhisperId)?.expectedHerReplyAt || 0) - Date.now())} 收到回复
                  </div>
                )}
                <div className="mt-3">
                  <button
                    onClick={closeWhisper}
                    className="rounded-full px-6 py-2 text-sm font-medium"
                    style={{ color: "#1a3a6b" }}
                  >
                    好的
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {view === "letters" && (
        <div className="absolute inset-0 z-40 flex flex-col" style={{ background: "linear-gradient(180deg, #D6EBF8 0%, #B8DBF0 100%)" }}>
          <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "rgba(26,58,107,0.15)" }}>
            <button onClick={() => setView("main")} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10" style={{ color: "#1a3a6b" }}>
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold" style={{ color: "#1a3a6b" }}>
              漂流瓶信件 · {bottleLetters.length} 封
            </h2>
            <button
              onClick={() => setShowLetter(true)}
              className="flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-bold text-white shadow-lg transition active:scale-95"
              style={{ background: "linear-gradient(135deg, #3A7CA5 0%, #1a3a6b 100%)" }}
            >
              ✎ 写新信
            </button>
          </div>

          <div className="flex-1 overflow-y-auto fancy-scroll p-4 space-y-4">
            {bottleLetters.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <div className="text-5xl opacity-40">✉️</div>
                <div className="text-sm" style={{ color: "#1a3a6b80" }}>还没有寄出的信</div>
                <button
                  onClick={() => setShowLetter(true)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-white"
                  style={{ background: "#1a3a6b" }}
                >
                  写第一封信
                </button>
              </div>
            ) : (
              bottleLetters.map((letter) => (
                <div key={letter.id} className="rounded-2xl bg-white shadow-md overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "#f0f0f0" }}>
                    <span className="text-sm font-medium" style={{ color: "#1a3a6b" }}>我写给TA</span>
                    <span className="text-xs" style={{ color: "#888" }}>
                      {new Date(letter.timestamp).toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}
                      {" "}
                      {new Date(letter.timestamp).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div
                    className="relative p-5 cursor-pointer"
                    style={{
                      backgroundImage: `url(${img("letter.jpg")})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      minHeight: "200px",
                    }}
                    onClick={() => toggleLetterExpand(letter.id)}
                  >
                    <div className={`relative z-10 whitespace-pre-line text-center leading-loose ${!expandedLetters.has(letter.id) && letter.content.length > 100 ? "line-clamp-4" : ""}`}
                      style={{
                        fontFamily: letter.font || "'Kaiti SC', serif",
                        fontSize: `${letter.fontSize || 16}px`,
                        color: "#1a3a6b",
                      }}
                    >
                      {letter.content}
                    </div>
                    {letter.content.length > 100 && (
                      <div className="relative z-10 mt-2 text-center text-xs" style={{ color: "#1a3a6b80" }}>
                        {expandedLetters.has(letter.id) ? "点击收起" : "点击展开全文"}
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 60px rgba(255,255,255,0.3)" }} />
                  </div>
                  <div className="space-y-1.5 px-4 py-2.5 border-t" style={{ borderColor: "#f0f0f0" }}>
                    <div className="flex items-center gap-1 text-xs" style={{ color: "#666" }}>
                      <span>📤</span>
                      <span>发出 · {new Date(letter.timestamp).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    {letter.receivedAt && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: "#27ae60" }}>
                        <span>✓</span>
                        <span>
                          对方已收到 · {new Date(letter.receivedAt).toLocaleDateString("zh-CN", { month: "long", day: "numeric" })} {new Date(letter.receivedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    )}
                    {letter.replyAt && letter.reply && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: "#3A7CA5" }}>
                        <span>💌</span>
                        <span>
                          收到回信 · {new Date(letter.replyAt).toLocaleDateString("zh-CN", { month: "long", day: "numeric" })} {new Date(letter.replyAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    )}
                    {!letter.receivedAt && letter.expectedReceiveAt && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: "#999" }}>
                        <span>⏳</span>
                        <span>
                          漂流中，还有 {formatRemainingTime(letter.expectedReceiveAt - Date.now())} 对方收到
                        </span>
                      </div>
                    )}
                    {letter.receivedAt && !letter.replyAt && letter.expectedReplyAt && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: "#999" }}>
                        <span>✍️</span>
                        <span>
                          对方正在回信，还有 {formatRemainingTime(letter.expectedReplyAt - Date.now())} 左右收到
                        </span>
                      </div>
                    )}
                  </div>
                  {letter.replyAt && letter.reply && (
                    <div className="px-4 pb-3">
                      <div className="mb-2 text-xs font-medium" style={{ color: "#3A7CA5" }}>TA 的回信：</div>
                      <div
                        className="relative rounded-xl overflow-hidden cursor-pointer"
                        style={{
                          backgroundImage: `url(${img("letter.jpg")})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                        onClick={() => toggleReplyExpand(letter.id)}
                      >
                        <div className={`relative z-10 p-4 whitespace-pre-line text-sm leading-relaxed ${!expandedReplies.has(letter.id) && letter.reply.length > 100 ? "line-clamp-4" : ""}`} style={{ color: "#1a3a6b" }}>
                          {letter.reply}
                        </div>
                        {letter.reply.length > 100 && (
                          <div className="relative z-10 pb-2 text-center text-xs" style={{ color: "#1a3a6b80" }}>
                            {expandedReplies.has(letter.id) ? "点击收起" : "点击展开全文"}
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 40px rgba(255,255,255,0.2)" }} />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
