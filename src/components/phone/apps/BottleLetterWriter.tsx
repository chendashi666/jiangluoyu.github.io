import { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { useAppStore } from "@/store/app";

const BASE = import.meta.env.BASE_URL;
const img = (name: string) => `${BASE}driftbottle/${name}`;

const FONTS = [
  { label: "默认", value: "inherit" },
  { label: "宋体", value: "'Songti SC', 'STSong', 'SimSun', serif" },
  { label: "楷体", value: "'Kaiti SC', 'STKaiti', 'KaiTi', serif" },
  { label: "黑体", value: "'PingFang SC', 'Heiti SC', sans-serif" },
  { label: "圆体", value: "'Yuanti SC', 'STYuanti', sans-serif" },
  { label: "手写", value: "'Hannotate SC', 'STHannotate', cursive" },
  { label: "行楷", value: "'Xingkai SC', 'STXingkai', cursive" },
  { label: "魏碑", value: "'Baoli SC', 'STBaoli', serif" },
  { label: "隶书", value: "'Libian SC', 'STLibian', serif" },
  { label: "娃娃体", value: "'Wawati SC', 'STWawati', cursive" },
  { label: "漫画体", value: "'Comic Sans MS', 'Hannotate SC', cursive" },
  { label: "幼圆", value: "'Yuppy SC', 'STYuppy', sans-serif" },
  { label: "细黑", value: "'Hiragino Sans GB', 'Microsoft YaHei', sans-serif" },
  { label: "仿宋", value: "'FangSong', 'STFangsong', serif" },
  { label: "舒体", value: "'FZShuTi', 'STShuti', cursive" },
  { label: "琥珀体", value: "'FZHuPo', 'STHupo', sans-serif" },
  { label: "彩云体", value: "'FZCaiYun', 'STCaiyun', sans-serif" },
  { label: "瘦金体", value: "'FZShaoEr-M11S', 'STShoujin', cursive" },
  { label: "硬笔书法", value: "'FZYingBiShuFa', 'STYingBiao', cursive" },
  { label: "蝴蝶体", value: "'FZHudie', 'Wawati SC', cursive" },
  { label: "布丁体", value: "'FZBudingTi', 'STWawati', cursive" },
  { label: "萝卜体", value: "'FZLuobo', 'STYuanti', sans-serif" },
  { label: "胖头鱼体", value: "'FZPangtouyu', 'STYuanti', sans-serif" },
  { label: "可爱体", value: "'ZCOOL KuaiLe', 'STYuanti', cursive" },
  { label: "文艺体", value: "'Ma Shan Zheng', 'Kaiti SC', cursive" },
  { label: "萌宠体", value: "'ZCOOL QingKe HuangYou', 'STYuanti', sans-serif" },
];

const PAGE_CHARS = 320; // 每页约320字

export default function BottleLetterWriter({ onClose, contactId }: { onClose: () => void; contactId: string | null }) {
  const sendBottleLetter = useAppStore((s) => s.sendBottleLetter);
  const [text, setText] = useState("");
  const [font, setFont] = useState(FONTS[1].value);
  const [fontSize, setFontSize] = useState(16);
  const [page, setPage] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [pageFlip, setPageFlip] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorRef = useRef<number>(0);

  // 自动分页
  const pages: string[] = [];
  for (let i = 0; i < text.length; i += PAGE_CHARS) {
    pages.push(text.slice(i, i + PAGE_CHARS));
  }
  if (pages.length === 0) pages.push("");

  const currentPage = pages[Math.min(page, pages.length - 1)] || "";
  const isLastPage = page >= pages.length - 1;

  // 自动跳到最后一页
  useEffect(() => {
    if (page > pages.length - 1) setPage(pages.length - 1);
  }, [pages.length]);

  const playFlipSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // 静默
    }
  };

  const handleNextPage = () => {
    if (isLastPage) return;
    setPageFlip(true);
    playFlipSound();
    setTimeout(() => {
      setPage((p) => p + 1);
      setPageFlip(false);
    }, 300);
  };

  const handlePrevPage = () => {
    if (page === 0) return;
    setPageFlip(true);
    playFlipSound();
    setTimeout(() => {
      setPage((p) => p - 1);
      setPageFlip(false);
    }, 300);
  };

  const handleSend = () => {
    if (!text.trim() || !contactId) return;
    sendBottleLetter(contactId, text.trim(), font, fontSize);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" />

      {/* 信纸 */}
      <div
        className={`relative ${pageFlip ? "animate-letterFlip" : ""}`}
        style={{
          width: "min(340px, 90vw)",
          height: "min(480px, 80vh)",
          perspective: "1200px",
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-lg shadow-2xl"
          style={{
            backgroundImage: `url(${img("letter.jpg")})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 transition hover:bg-black/50 active:scale-90"
            style={{ color: "#fff" }}
          >
            <X className="h-5 w-5" />
          </button>

          {/* 写字区 - 从1/8处开始，不滚动，超长自动到下一页 */}
          <textarea
            ref={textareaRef}
            value={currentPage}
            onChange={(e) => {
              const cursorPos = e.target.selectionStart;
              const newText = text.slice(0, page * PAGE_CHARS) + e.target.value + text.slice((page + 1) * PAGE_CHARS);
              cursorRef.current = cursorPos;
              setText(newText);
              // 在下一帧恢复光标位置
              requestAnimationFrame(() => {
                if (textareaRef.current) {
                  textareaRef.current.selectionStart = cursorRef.current;
                  textareaRef.current.selectionEnd = cursorRef.current;
                }
              });
            }}
            placeholder="在此写信..."
            className="absolute left-0 right-0 top-0 bottom-0 resize-none overflow-hidden border-none bg-transparent text-center focus:outline-none"
            style={{
              fontFamily: font,
              fontSize: `${fontSize}px`,
              color: "#1a3a6b",
              lineHeight: 1.8,
              background: "transparent",
              paddingTop: "15%",
              paddingLeft: "24px",
              paddingRight: "24px",
              paddingBottom: "80px",
              height: "100%",
              width: "100%",
            }}
          />

          {/* 字体设置面板 - 显示在控制栏上方 */}
          {showSettings && (
            <div className="absolute bottom-20 left-3 right-3 z-30 flex flex-col gap-2 rounded-xl bg-white p-3 shadow-2xl">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: "#1a3a6b" }}>字体设置</span>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/10"
                >
                  <X className="h-3.5 w-3.5" style={{ color: "#1a3a6b" }} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FONTS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFont(f.value)}
                    className={`rounded-md px-2.5 py-1.5 text-xs transition active:scale-95 ${
                      font === f.value
                        ? "text-white shadow-md"
                        : "bg-[#1a3a6b10] hover:bg-[#1a3a6b20]"
                    }`}
                    style={{
                      fontFamily: f.value,
                      color: font === f.value ? "#fff" : "#1a3a6b",
                      background: font === f.value ? "#1a3a6b" : undefined,
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs w-8" style={{ color: "#1a3a6b" }}>字号</span>
                <input
                  type="range"
                  min={12}
                  max={24}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs w-8 text-right" style={{ color: "#1a3a6b" }}>{fontSize}</span>
              </div>
            </div>
          )}

          {/* 底部控制栏 */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-2 bg-gradient-to-t from-black/30 to-transparent px-3 pb-3 pt-6">
            {/* 翻页按钮 */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevPage}
                disabled={page === 0}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 transition hover:bg-white active:scale-90 disabled:opacity-30"
                style={{ color: "#1a3a6b" }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-medium" style={{ color: "#1a3a6b" }}>
                {page + 1} / {pages.length}
              </span>
              <button
                onClick={handleNextPage}
                disabled={isLastPage}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 transition hover:bg-white active:scale-90 disabled:opacity-30"
                style={{ color: "#1a3a6b" }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex w-full items-center justify-between gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="rounded-lg bg-white/80 px-3 py-1.5 text-[11px] font-medium transition hover:bg-white active:scale-95"
                style={{ color: "#1a3a6b" }}
              >
                字体
              </button>

              <button
                onClick={handleSend}
                disabled={!text.trim()}
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-bold transition disabled:opacity-40 active:scale-95"
                style={{ background: "#1a3a6b", color: "#fff" }}
              >
                <Send className="h-3.5 w-3.5" />
                寄出
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
