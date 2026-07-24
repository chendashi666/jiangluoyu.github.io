import { useEffect, useRef, useState } from "react";
import { AppHeader } from "./HomeScreen";
import { PetCanvas } from "./PetApp";
import { useAppStore } from "@/store/app";
import { DEFAULT_PET_CONFIG, type BallPetConfig } from "@/types/pet";
import { Eye } from "lucide-react";

// 简约风格小手图标
function HandIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))" }}>
      <path
        d="M10 17V8.5a1.5 1.5 0 0 1 3 0V15M13 15V6.5a1.5 1.5 0 0 1 3 0V15M16 15V7a1.5 1.5 0 0 1 3 0v8M19 15V9a1.5 1.5 0 0 1 3 0v7"
        fill="none"
        stroke="#FFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 17c-1 1.5-2 3-2 5 0 3.5 3 6 6.5 6s6.5-2 6.5-5v-3c0-1-0.5-1.5-1.5-1.5s-1.5 0.5-1.5 1.5M8 18c-0.8 0-1.5 0.7-1.5 1.5S7 21 7.8 21"
        fill="rgba(255,255,255,0.92)"
        stroke="#FFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ChatApp({ onBack }: { onBack: () => void }) {
  const contacts = useAppStore((s) => s.contacts);
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const toggleView = useAppStore((s) => s.toggleView);
  const beauty = useAppStore((s) => s.beauty);
  const patPet = useAppStore((s) => s.patPet);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const contactId = activeConv?.type === "private" ? activeConv.memberIds[0] : contacts[0]?.id;
  const contact = contacts.find((c) => c.id === contactId);

  // 本会话独立的宠物配置
  const [petConfig, setPetConfig] = useState<BallPetConfig>(DEFAULT_PET_CONFIG);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`muxu-pet-${activeConversationId}`);
      setPetConfig(saved ? { ...DEFAULT_PET_CONFIG, ...JSON.parse(saved) } : { ...DEFAULT_PET_CONFIG });
    } catch {
      setPetConfig({ ...DEFAULT_PET_CONFIG });
    }
  }, [activeConversationId]);

  // 监听 DIY 保存事件，实时同步宠物外观
  useEffect(() => {
    const handler = (e: Event) => {
      const evt = e as CustomEvent;
      if (evt.detail?.key === `muxu-pet-${activeConversationId}` && evt.detail?.config) {
        setPetConfig({ ...DEFAULT_PET_CONFIG, ...evt.detail.config });
      }
    };
    window.addEventListener("pet-config-updated", handler);
    return () => window.removeEventListener("pet-config-updated", handler);
  }, [activeConversationId]);

  // === 宠物互动状态 ===
  const petWrapRef = useRef<HTMLDivElement>(null);
  const [patSignal, setPatSignal] = useState(0);
  const [petPrompt, setPetPrompt] = useState<string | null>(null);
  const promptTimer = useRef<number | undefined>(undefined);

  const showPrompt = (text: string) => {
    setPetPrompt(text);
    if (promptTimer.current) window.clearTimeout(promptTimer.current);
    promptTimer.current = window.setTimeout(() => setPetPrompt(null), 2600);
  };
  const triggerPat = (prompt: string) => {
    setPatSignal((n) => n + 1);
    showPrompt(prompt);
  };
  useEffect(() => () => { if (promptTimer.current) window.clearTimeout(promptTimer.current); }, []);

  // 对方在聊天中有 4% 概率摸摸宠物 → 聊天系统消息提醒
  useEffect(() => {
    const id = window.setInterval(() => {
      if (Math.random() < 0.04) {
        setPatSignal((n) => n + 1);
        patPet(activeConversationId, "her");
      }
    }, 12000);
    return () => window.clearInterval(id);
  }, [activeConversationId, patPet]);

  // === 长按我头像 → 出现小手 → 拖到宠物上摸摸 ===
  const pressTimer = useRef<number | undefined>(undefined);
  const [showHand, setShowHand] = useState(false);
  const [handPos, setHandPos] = useState({ x: 0, y: 0 });
  const handActive = useRef(false);

  // 全局监听 pointermove / pointerup，确保小手始终跟随手指
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (handActive.current) setHandPos({ x: e.clientX, y: e.clientY });
    };
    const up = (e: PointerEvent) => {
      if (pressTimer.current) { window.clearTimeout(pressTimer.current); pressTimer.current = undefined; }
      if (handActive.current) {
        const wrap = petWrapRef.current;
        if (wrap) {
          const r = wrap.getBoundingClientRect();
          if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
            setPatSignal((n) => n + 1);
            // 我摸宠物只动画，不推聊天消息
          }
        }
        handActive.current = false;
        setShowHand(false);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [activeConversationId, patPet]);

  const onAvatarDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setHandPos({ x: e.clientX, y: e.clientY });
    pressTimer.current = window.setTimeout(() => {
      handActive.current = true;
      setShowHand(true);
    }, 400);
  };

  if (!activeConv || !contact) return null;

  const messages = activeConv.messages;
  const view = activeConv.view;
  const isHer = view === "her";
  const herName = contact.name;
  const myName = beauty.myName;
  const herAvatar = contact.avatar;
  const myAvatar = beauty.myAvatar;

  return (
    <div className="flex h-full flex-col">
      <AppHeader title={`和${myName}的聊天`} onBack={onBack} />
      <div className="fancy-scroll flex-1 overflow-y-auto px-3 py-3">
        {/* 本会话的宠物展示 + 互动 */}
        <div
          ref={petWrapRef}
          className="relative mb-3 flex items-center justify-center rounded-2xl py-2"
          style={{ background: "color-mix(in srgb, var(--accent) 8%, transparent)" }}
        >
          <PetCanvas config={petConfig} size={120} patSignal={patSignal} />
          {/* 摸摸提示气泡 */}
          {petPrompt && (
            <div
              className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-medium"
              style={{
                background: "var(--card)",
                color: "var(--text)",
                border: "1px solid var(--card-border)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                animation: "petPromptPop 0.3s ease",
              }}
            >
              {petPrompt}
            </div>
          )}
          {/* 引导：长按头像摸摸 */}
          <div
            className="pointer-events-none absolute bottom-1 right-2 text-[8px] opacity-50"
            style={{ color: "var(--text-soft)" }}
          >
            长按头像摸摸
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {messages.slice(-30).map((m, i) => {
            const herSide = m.sender === contactId;
            const prev = messages[messages.length - 30 + i - 1];
            const showAvatar = !prev || prev.sender !== m.sender;
            return (
              <div
                key={m.id}
                className={`flex items-center gap-1.5 ${herSide ? "justify-end" : "justify-start"}`}
              >
                {!herSide && (
                  <div className="w-7 shrink-0">
                    {showAvatar && (
                      <div
                        className="flex h-7 w-7 cursor-pointer select-none items-center justify-center rounded-full text-[10px] touch-none"
                        style={{ background: "var(--accent)", color: "var(--card)" }}
                        onPointerDown={onAvatarDown}
                        title="长按可摸摸小宠物"
                      >
                        {myAvatar}
                      </div>
                    )}
                  </div>
                )}
                {m.type === "sticker" && m.sticker ? (
                  <img src={m.sticker} alt="sticker" className="max-h-20 max-w-[60%] rounded-lg object-contain" />
                ) : (
                  <div
                    className="max-w-[70%] rounded-2xl px-2.5 py-1.5 text-[11px]"
                    style={{
                      background: herSide ? "var(--accent)" : "var(--card)",
                      color: herSide ? "var(--card)" : "var(--text)",
                      border: herSide ? "none" : "1px solid var(--card-border)",
                    }}
                  >
                    {m.text}
                    {m.moodNote && (
                      <div className="mt-0.5 text-[9px] opacity-70">🌸 {m.moodNote}</div>
                    )}
                  </div>
                )}
                {herSide && (
                  <div className="w-7 shrink-0">
                    {showAvatar && (
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[10px]"
                        style={{ background: "var(--text)", color: "var(--card)" }}
                      >
                        {herAvatar}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="border-t px-3 py-2" style={{ borderColor: "var(--card-border)" }}>
        <button
          onClick={() => toggleView(activeConv.id)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-medium transition active:scale-95"
          style={{
            background: "color-mix(in srgb, var(--accent) 12%, transparent)",
            color: "var(--accent)",
          }}
        >
          <Eye className="h-3.5 w-3.5" />
          {isHer ? `回到${myName}的视角` : `偷看${herName}的视角`}
        </button>
      </div>

      {/* 跟随手指的简约小手 */}
      {showHand && (
        <div
          className="pointer-events-none fixed z-50"
          style={{ left: handPos.x, top: handPos.y, transform: "translate(-30%, -20%)" }}
        >
          <HandIcon />
        </div>
      )}

      {/* 提示动画 keyframes */}
      <style>{`@keyframes petPromptPop{0%{opacity:0;transform:translate(-50%,6px) scale(0.8)}100%{opacity:1;transform:translate(-50%,0) scale(1)}}`}</style>
    </div>
  );
}
