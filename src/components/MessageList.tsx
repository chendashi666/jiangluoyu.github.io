import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import type { Message, Contact, TomatoThrow, ViewSide } from "@/types";
import { Music, Play, Pause, Reply, RotateCcw, Trash2 } from "lucide-react";
import { PetCanvas } from "./phone/apps/PetApp";
import { DEFAULT_PET_CONFIG, type BallPetConfig } from "@/types/pet";

function HiddenPetPart({ part, side }: { part: "ear" | "top" | "accessory"; side: "left" | "right" }) {
  const convId = useAppStore((s) => s.activeConversationId);
  const [config, setConfig] = useState<BallPetConfig>(DEFAULT_PET_CONFIG);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`muxu-pet-${convId}`);
      if (saved) setConfig({ ...DEFAULT_PET_CONFIG, ...JSON.parse(saved) });
      else setConfig({ ...DEFAULT_PET_CONFIG });
    } catch { setConfig({ ...DEFAULT_PET_CONFIG }); }
  }, [convId]);

  useEffect(() => {
    const handler = (e: Event) => {
      const evt = e as CustomEvent;
      if (evt.detail?.key === `muxu-pet-${convId}` && evt.detail?.config) {
        setConfig({ ...DEFAULT_PET_CONFIG, ...evt.detail.config });
      }
    };
    window.addEventListener("pet-config-updated", handler);
    return () => window.removeEventListener("pet-config-updated", handler);
  }, [convId]);

  const staticConfig = useMemo(() => ({
    ...config,
    breathe: false,
    wobble: false,
    bounce: false,
    blink: false,
  }), [config]);

  const petSize = 60;
  let clipStyle: React.CSSProperties = { overflow: "hidden" };
  let flip = false;
  let petOffset = -10;

  if (part === "ear") {
    clipStyle = { ...clipStyle, height: petSize * 0.28, width: petSize };
    flip = side === "left";
    petOffset = -24;
  } else if (part === "top") {
    clipStyle = { ...clipStyle, height: petSize * 0.33, width: petSize };
    flip = side === "left";
    petOffset = -18;
  } else {
    clipStyle = { ...clipStyle, height: petSize * 0.22, width: petSize * 0.32 };
    if (side === "left") {
      clipStyle = { ...clipStyle, marginLeft: 0 };
    } else {
      clipStyle = { ...clipStyle, marginLeft: petSize * 0.68 };
    }
    petOffset = -12;
  }

  return (
    <div style={{ ...clipStyle, transform: flip ? "scaleX(-1)" : "none" }}>
      <div style={{ marginTop: `${petOffset}px` }}>
        <PetCanvas config={staticConfig} size={petSize} patSignal={0} />
      </div>
    </div>
  );
}

export default function MessageList() {
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const contacts = useAppStore((s) => s.contacts);
  const beauty = useAppStore((s) => s.beauty);
  const themeId = beauty.themeId;
  const isCuteMoe = themeId === "cute-moe";
  const pat = useAppStore((s) => s.pat);
  const quoteMessage = useAppStore((s) => s.quoteMessage);
  const recallMessage = useAppStore((s) => s.recallMessage);
  const deleteMessage = useAppStore((s) => s.deleteMessage);
  const throwTomato = useAppStore((s) => s.throwTomato);
  const tomatoThrows = useAppStore((s) => s.tomatoThrows);
  const findPet = useAppStore((s) => s.findPet);
  const petHidingMode = useAppStore((s) => s.petHidingMode);
  const setPetHidingMode = useAppStore((s) => s.setPetHidingMode);
  const hidePetAtMessage = useAppStore((s) => s.hidePetAtMessage);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ messageId: string; x: number; y: number; sender: string } | null>(null);
  const [tomatoPicker, setTomatoPicker] = useState<{ senderId: string; msgId: string; x: number; y: number } | null>(null);
  const [tomatoMsgCollapsed, setTomatoMsgCollapsed] = useState(true);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);


  const conv = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const messages = conv?.messages || [];
  const isFlipping = conv?.isFlipping || false;
  const view = conv?.view || "me";

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleLongPress = useCallback((e: React.TouchEvent | React.MouseEvent, messageId: string, sender: string) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.type === "contextmenu" ? (e as React.MouseEvent).clientX : rect.left + rect.width / 2;
    const y = e.type === "contextmenu" ? (e as React.MouseEvent).clientY : rect.top;
    setContextMenu({ messageId, x, y, sender });
  }, []);

  const handleTouchStart = useCallback((messageId: string, sender: string) => {
    longPressTimer.current = setTimeout(() => {
      setContextMenu((prev) => {
        if (prev?.messageId === messageId) return prev;
        const el = document.querySelector(`[data-msg-id="${messageId}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          return { messageId, x: rect.left + rect.width / 2, y: rect.top, sender };
        }
        return { messageId, x: window.innerWidth / 2, y: window.innerHeight / 2, sender };
      });
    }, 500);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const lastTomatoTime = useRef(0);
  const lastTomatoTarget = useRef<string | null>(null);
  const avatarSwipeStart = useRef<{ x: number; y: number; senderId: string; msgId: string } | null>(null);

  const showTomatoPicker = useCallback((senderId: string, msgId: string = "", clientX: number, clientY: number) => {
    if (!conv) return;
    if (senderId === "me") return;
    setTomatoPicker({ senderId, msgId, x: clientX, y: clientY });
  }, [conv]);

  const handlePickTomato = useCallback((count: number) => {
    if (!tomatoPicker || !activeConversationId) return;
    const now = Date.now();
    if (now - lastTomatoTime.current < 1000 && lastTomatoTarget.current === tomatoPicker.senderId) {
      setTomatoPicker(null);
      return;
    }
    lastTomatoTime.current = now;
    lastTomatoTarget.current = tomatoPicker.senderId;
    throwTomato(activeConversationId, "me", tomatoPicker.senderId, tomatoPicker.msgId, false, count);
    setTomatoPicker(null);
  }, [tomatoPicker, activeConversationId, throwTomato]);

  const handleAvatarSwipeStart = useCallback((senderId: string, msgId: string, clientX: number, clientY: number) => {
    if (!conv || senderId === "me") return;
    avatarSwipeStart.current = { x: clientX, y: clientY, senderId, msgId };
  }, [conv]);

  const handleAvatarSwipeMove = useCallback((clientX: number, clientY: number) => {
    const start = avatarSwipeStart.current;
    if (!start) return;
    const dx = clientX - start.x;
    const dy = clientY - start.y;
    if (dx < -50 && Math.abs(dx) > Math.abs(dy) * 2) {
      showTomatoPicker(start.senderId, start.msgId, start.x, start.y);
      avatarSwipeStart.current = null;
    }
  }, [showTomatoPicker]);

  const handleAvatarSwipeEnd = useCallback(() => {
    avatarSwipeStart.current = null;
  }, []);

  // 鼠标左滑触发
  const avatarMouseDown = useRef<{ x: number; y: number; senderId: string; msgId: string } | null>(null);

  const handleAvatarMouseDown = useCallback((senderId: string, msgId: string, clientX: number, clientY: number) => {
    if (!conv || senderId === "me") return;
    avatarMouseDown.current = { x: clientX, y: clientY, senderId, msgId };
  }, [conv]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!avatarMouseDown.current) return;
      const start = avatarMouseDown.current;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (dx < -50 && Math.abs(dx) > Math.abs(dy) * 2) {
        showTomatoPicker(start.senderId, start.msgId, start.x, start.y);
        avatarMouseDown.current = null;
      }
    };
    const handleMouseUp = () => {
      avatarMouseDown.current = null;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [showTomatoPicker]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isFlipping]);

  const getContactName = (senderId: string): string => {
    if (senderId === "me") return beauty.myName;
    const contact = contacts.find((c) => c.id === senderId);
    return contact?.name || "未知";
  };

  const getContact = (senderId: string): Contact | undefined => {
    return contacts.find((c) => c.id === senderId);
  };

  // 获取联系人的私聊会话头像设置（群聊中使用各自会话的头像）
  const getPrivateConvAvatar = (senderId: string): { text: string; image: string } => {
    const privateConv = conversations.find(
      (c) => c.type === "private" && c.memberIds.includes(senderId)
    );
    return {
      text: privateConv?.herAvatarText || "",
      image: privateConv?.herAvatarImage || "",
    };
  };

  const getAvatarText = (senderId: string): string => {
    if (senderId === "me") {
      return conv?.myAvatarText || beauty.myAvatar;
    }
    const contact = getContact(senderId);
    if (conv?.type === "group") {
      const priv = getPrivateConvAvatar(senderId);
      if (priv.text) return priv.text;
    }
    return contact?.avatar || conv?.herAvatarText || "?";
  };

  const getAvatarImage = (senderId: string): string => {
    if (senderId === "me") {
      return conv?.myAvatarImage || beauty.myAvatarImage;
    }
    const contact = getContact(senderId);
    if (conv?.type === "group") {
      const priv = getPrivateConvAvatar(senderId);
      if (priv.image) return priv.image;
    }
    return contact?.avatarImage || conv?.herAvatarImage || beauty.herAvatarImage || "";
  };

  const renderTextWithMention = (text: string, mentionTarget?: string) => {
    if (!mentionTarget) return text;
    const mentionName = getContactName(mentionTarget);
    const mentionPattern = new RegExp(`(@${mentionName})`, "g");
    const parts = text.split(mentionPattern);
    return parts.map((part, i) =>
      part === `@${mentionName}` ? (
        <span key={i} className="font-semibold" style={{ color: "var(--accent)" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  if (!conv) {
    return (
      <div className="chat-bg fancy-scroll flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 items-center justify-center h-full">
          <p style={{ color: "var(--text-soft)" }}>选择一个会话开始聊天</p>
        </div>
      </div>
    );
  }

  const getSide = (sender: string): "left" | "right" => {
    if (view === "me") {
      return sender === "me" ? "right" : "left";
    } else {
      return sender === "me" ? "left" : "right";
    }
  };

  const bubbleStyle = getBubbleStyle(beauty.bubbleStyle);

  return (
    <div
      ref={scrollRef}
      className="chat-bg fancy-scroll flex-1 overflow-y-auto px-4 py-6 md:px-8"
      onClick={petHidingMode ? () => {} : undefined}
    >
      {petHidingMode && (
        <div
          className="sticky top-0 z-30 mx-auto mb-3 flex max-w-3xl items-center justify-between rounded-xl px-4 py-2"
          style={{ background: "color-mix(in srgb, var(--accent) 15%, var(--card))", backdropFilter: "blur(8px)" }}
        >
          <span className="text-xs font-medium" style={{ color: "var(--text)" }}>
            点击任意消息，把宠物藏在后面～🐾
          </span>
          <button
            className="rounded-lg px-3 py-1 text-xs font-medium"
            style={{ background: "var(--card)", color: "var(--text-soft)", border: "1px solid var(--card-border)" }}
            onClick={(e) => { e.stopPropagation(); setPetHidingMode(false); }}
          >
            取消
          </button>
        </div>
      )}
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const next = messages[i + 1];
          const isNew = i === messages.length - 1;

          const isTomatoSystemMsg = m.type === "system" && (m.systemText?.includes("番茄") || m.systemText?.includes("扔了"));
          const prevIsTomato = prev?.type === "system" && (prev.systemText?.includes("番茄") || prev.systemText?.includes("扔了"));
          const nextIsTomato = next?.type === "system" && (next.systemText?.includes("番茄") || next.systemText?.includes("扔了"));

          // 折叠模式下，只显示第一条番茄消息，后面的跳过
          if (tomatoMsgCollapsed && isTomatoSystemMsg && prevIsTomato) {
            return null;
          }

          if (m.type === "system") {
            const hasMoreTomato = isTomatoSystemMsg && (nextIsTomato || prevIsTomato);
            return (
              <SystemMessage
                key={m.id}
                message={m}
                collapsed={tomatoMsgCollapsed && hasMoreTomato}
                onToggleCollapse={hasMoreTomato ? () => setTomatoMsgCollapsed((v) => !v) : undefined}
              />
            );
          }

          const side = getSide(m.sender);
          const isLeft = side === "left";

          if (m.type === "rps" && m.rps) {
            return (
              <RPSBubble
                key={m.id}
                message={m}
                side={side}
                getContactName={getContactName}
                getAvatarText={getAvatarText}
                getAvatarImage={getAvatarImage}
                bubbleStyle={bubbleStyle}
              />
            );
          }

          if (m.type === "poll" && m.poll) {
            return (
              <PollBubble
                key={m.id}
                message={m}
                side={side}
                getContactName={getContactName}
                getAvatarText={getAvatarText}
                getAvatarImage={getAvatarImage}
                bubbleStyle={bubbleStyle}
              />
            );
          }

          if (m.recalled) {
            const side = getSide(m.sender);
            const isMine = (view === "me" && m.sender === "me") || (view === "her" && m.sender !== "me");
            return (
              <div key={m.id} className={`flex items-center gap-2 ${side === "left" ? "justify-start" : "justify-end"}`}>
                {side === "left" && <div className="w-9 shrink-0" />}
                <div className="py-1 px-3 text-[13px] italic" style={{ color: "var(--text-soft)" }}>
                  {isMine ? "你撤回了一条消息" : "对方撤回了一条消息"}
                </div>
                {side === "right" && <div className="w-9 shrink-0" />}
              </div>
            );
          }

          return (
            <div key={m.id} className={`relative flex items-center gap-2 ${isLeft ? "justify-start" : "justify-end"}`}
              data-msg-id={m.id}
              data-sender={m.sender}
              onContextMenu={(e) => handleLongPress(e, m.id, m.sender)}
              onTouchStart={() => handleTouchStart(m.id, m.sender)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchEnd}
              onClick={petHidingMode ? (e) => {
                e.stopPropagation();
                hidePetAtMessage(activeConversationId, m.id, isLeft ? "left" : "right");
              } : undefined}
              style={petHidingMode ? { cursor: "pointer" } : undefined}
            >
              {isLeft && (
                <div className="flex w-9 shrink-0 justify-center">
                  <MessageAvatar
                    senderId={m.sender}
                    avatarText={getAvatarText(m.sender)}
                    avatarImage={getAvatarImage(m.sender)}
                    onPat={() => pat(activeConversationId, m.sender)}
                    onSwipeStart={handleAvatarSwipeStart}
                    onSwipeMove={handleAvatarSwipeMove}
                    onSwipeEnd={handleAvatarSwipeEnd}
                    onMouseDown={handleAvatarMouseDown}
                    msgId={m.id}
                    tomatoCount={tomatoThrows.filter((t) => t.targetMsgId === m.id && t.conversationId === activeConversationId).length}
                  />
                </div>
              )}
              <div className={`flex flex-col ${isLeft ? "items-start" : "items-end"} max-w-[78%]`}>
                {isLeft && m.sender !== "me" && (
                  <span
                    className="mb-0.5 px-1 text-xs cursor-pointer select-none active:opacity-60 flex items-center gap-1 relative z-10"
                    style={{ color: "color-mix(in srgb, var(--text) 60%, transparent)" }}
                    onDoubleClick={(e) => showTomatoPicker(m.sender, m.id, e.clientX, e.clientY)}
                    title="双击扔番茄"
                  >
                    {m.isAutoInitiated && (
                      <span className="text-[#FFB347]" style={{ fontSize: "10px" }}>⭐</span>
                    )}
                    {getContactName(m.sender)}
                  </span>
                )}
                <div className="relative">
                  {beauty.petEnabled && conv?.type !== "group" && conv?.petHidden?.messageId === m.id && (
                    <button
                      className="absolute z-20 cursor-pointer overflow-visible p-0 transition hover:scale-110 active:scale-95"
                      style={{
                        top: "-10px",
                        [conv.petHidden.side === "left" ? "left" : "right"]: "8px",
                        background: "transparent",
                        border: "none",
                        lineHeight: 0,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        findPet(activeConversationId, "me");
                      }}
                      title="找到宠物了！"
                    >
                      <HiddenPetPart part={conv.petHidden.part} side={conv.petHidden.side} />
                    </button>
                  )}
                  <MessageBubble
                    message={m}
                    side={side}
                    bubbleStyle={bubbleStyle}
                    renderTextWithMention={renderTextWithMention}
                    isNew={isNew}
                  />
                </div>
              </div>
              {!isLeft && (
                <div className="flex w-9 shrink-0 justify-center">
                  <MessageAvatar
                    senderId={m.sender}
                    avatarText={getAvatarText(m.sender)}
                    avatarImage={getAvatarImage(m.sender)}
                    onSwipeStart={handleAvatarSwipeStart}
                    onSwipeMove={handleAvatarSwipeMove}
                    onSwipeEnd={handleAvatarSwipeEnd}
                    onMouseDown={handleAvatarMouseDown}
                    msgId={m.id}
                    tomatoCount={tomatoThrows.filter((t) => t.targetMsgId === m.id && t.conversationId === activeConversationId).length}
                  />
                </div>
              )}
            </div>
          );
        })}

        {isFlipping && <FlippingHint side={view === "me" ? "left" : "right"} name={getContactName(conv.memberIds[0])} />}
      </div>

      {contextMenu && activeConversationId && (
        <div
          className="fixed inset-0 z-50"
          onClick={(e) => { e.stopPropagation(); setContextMenu(null); }}
        >
          <div
            className="absolute z-50 flex flex-col rounded-xl border shadow-xl overflow-hidden min-w-[120px]"
            style={{
              left: Math.min(contextMenu.x, window.innerWidth - 140),
              top: Math.min(contextMenu.y - 10, window.innerHeight - 160),
              background: "var(--card)",
              borderColor: "var(--card-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                quoteMessage(activeConversationId, contextMenu.messageId);
                setContextMenu(null);
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-[13px] transition hover:bg-black/5"
              style={{ color: "var(--text)" }}
            >
              <Reply className="h-4 w-4" />
              引用
            </button>
            {contextMenu.sender === "me" && (
              <button
                onClick={() => {
                  recallMessage(activeConversationId, contextMenu.messageId);
                  setContextMenu(null);
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-[13px] transition hover:bg-black/5"
                style={{ color: "var(--text)" }}
              >
                <RotateCcw className="h-4 w-4" />
                撤回
              </button>
            )}
            <button
              onClick={() => {
                deleteMessage(activeConversationId, contextMenu.messageId);
                setContextMenu(null);
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-[13px] transition hover:bg-red-50"
              style={{ color: "var(--accent)" }}
            >
              <Trash2 className="h-4 w-4" />
              删除
            </button>
          </div>
        </div>
      )}

      {tomatoPicker && (
        <div
          className="fixed inset-0 z-50"
          onClick={(e) => { e.stopPropagation(); setTomatoPicker(null); }}
        >
          <div
            className="absolute z-50 rounded-2xl border shadow-xl p-4"
            style={{
              left: Math.min(Math.max(tomatoPicker.x - 80, 10), window.innerWidth - 180),
              top: Math.min(Math.max(tomatoPicker.y - 60, 10), window.innerHeight - 120),
              background: "var(--card)",
              borderColor: "var(--card-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 text-center text-[12px] font-medium" style={{ color: "var(--text)" }}>
              选择扔几个番茄 🍅
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => handlePickTomato(n)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold transition hover:scale-110 active:scale-95"
                  style={{
                    background: n === 1 ? "#FF6B6B22" : n === 2 ? "#FF8E5322" : "#E91E6322",
                    color: n === 1 ? "#FF6B6B" : n === 2 ? "#FF8E53" : "#E91E63",
                    border: `1px solid ${n === 1 ? "#FF6B6B" : n === 2 ? "#FF8E53" : "#E91E63"}`,
                  }}
                >
                  {n}🍅
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tomatoThrows.filter((t) => t.conversationId === activeConversationId).map((tomato) => (
        <TomatoAnimation key={tomato.id} tomato={tomato} messages={messages} view={view} />
      ))}
    </div>
  );
}

const tomatoImgUrl = "https://i.postimg.cc/ZKVRS4kH/retouch-2026071501420750.png";

function MessageAvatar({
  senderId,
  avatarText,
  avatarImage,
  size = "md",
  onPat,
  onSwipeStart,
  onSwipeMove,
  onSwipeEnd,
  onMouseDown: onAvatarMouseDown,
  msgId,
  tomatoCount,
}: {
  senderId: string;
  avatarText: string;
  avatarImage: string;
  size?: "sm" | "md";
  onPat?: () => void;
  onSwipeStart?: (senderId: string, msgId: string, clientX: number, clientY: number) => void;
  onSwipeMove?: (clientX: number, clientY: number) => void;
  onSwipeEnd?: () => void;
  onMouseDown?: (senderId: string, msgId: string, clientX: number, clientY: number) => void;
  msgId?: string;
  tomatoCount?: number;
}) {
  const [isPating, setIsPating] = useState(false);
  const dim = size === "sm" ? "h-[36px] w-[36px] text-[12px]" : "h-[36px] w-[36px] text-[12px]";
  const bgVar = senderId === "me" ? "var(--accent)" : "var(--text)";
  const textVar = "var(--card)";
  const pressTimer = useRef<number | undefined>(undefined);

  const handleDoubleClick = () => {
    if (senderId !== "me" && onPat) {
      setIsPating(true);
      onPat();
      setTimeout(() => setIsPating(false), 300);
    }
  };

  const handleContextMenu = (_e: React.MouseEvent) => {
  };

  // 我的头像：长按 400ms 派发事件 → DesktopPet 显示小手
  const pressStart = useRef<{ x: number; y: number } | null>(null);
  const startMyLongPress = (x: number, y: number) => {
    pressStart.current = { x, y };
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => {
      pressStart.current = null; // 已触发，后续移动不再取消
      window.dispatchEvent(new CustomEvent("avatar-longpress", { detail: { x, y } }));
    }, 400);
  };
  const cancelMyLongPress = () => {
    if (pressTimer.current) { window.clearTimeout(pressTimer.current); pressTimer.current = undefined; }
    pressStart.current = null;
  };
  // 手指移动超过阈值才取消（避免手机按压抖动误取消长按）
  const onMyTouchMove = (x: number, y: number) => {
    const s = pressStart.current;
    if (!s) return; // 未开始或已触发
    if (Math.abs(x - s.x) > 10 || Math.abs(y - s.y) > 10) cancelMyLongPress();
  };

  const longPressTitle = senderId === "me" ? "长按摸摸小宠物" : "双击拍一拍";

  const avatarEl = avatarImage ? (
    <div
      data-avatar="true"
      className={`shrink-0 overflow-hidden rounded-lg select-none cursor-pointer transition-transform active:scale-95 ${dim} ${isPating ? "animate-bounce" : ""}`}
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => {
        if (senderId === "me") e.stopPropagation();
        handleContextMenu(e);
      }}
      onTouchStart={(e) => {
        if (e.touches.length === 1) {
          if (senderId === "me") {
            e.stopPropagation();
            startMyLongPress(e.touches[0].clientX, e.touches[0].clientY);
          } else {
            onSwipeStart?.(senderId, msgId || "", e.touches[0].clientX, e.touches[0].clientY);
          }
        }
      }}
      onTouchMove={(e) => {
        if (e.touches.length === 1) {
          if (senderId === "me") {
            e.stopPropagation();
            onMyTouchMove(e.touches[0].clientX, e.touches[0].clientY);
          } else {
            onSwipeMove?.(e.touches[0].clientX, e.touches[0].clientY);
          }
        }
      }}
      onTouchEnd={(e) => {
        if (senderId === "me") { e.stopPropagation(); cancelMyLongPress(); }
        else onSwipeEnd?.();
      }}
      onTouchCancel={(e) => {
        if (senderId === "me") { e.stopPropagation(); cancelMyLongPress(); }
        else onSwipeEnd?.();
      }}
      onMouseDown={(e) => {
        if (senderId === "me") {
          e.stopPropagation();
          startMyLongPress(e.clientX, e.clientY);
        } else {
          onAvatarMouseDown?.(senderId, msgId || "", e.clientX, e.clientY);
        }
      }}
      onMouseUp={senderId === "me" ? cancelMyLongPress : undefined}
      onMouseLeave={senderId === "me" ? cancelMyLongPress : undefined}
      title={longPressTitle}
    >
      <img src={avatarImage} alt="avatar" className="h-full w-full object-cover" />
    </div>
  ) : (
    <div
      data-avatar="true"
      className={`flex shrink-0 items-center justify-center rounded-lg font-stamp select-none cursor-pointer transition-transform active:scale-95 ${dim} ${isPating ? "animate-bounce" : ""}`}
      style={{
        background: bgVar,
        color: textVar,
        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
      }}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => {
        if (senderId === "me") e.stopPropagation();
        handleContextMenu(e);
      }}
      onTouchStart={(e) => {
        if (e.touches.length === 1) {
          if (senderId === "me") {
            e.stopPropagation();
            startMyLongPress(e.touches[0].clientX, e.touches[0].clientY);
          } else {
            onSwipeStart?.(senderId, msgId || "", e.touches[0].clientX, e.touches[0].clientY);
          }
        }
      }}
      onTouchMove={(e) => {
        if (e.touches.length === 1) {
          if (senderId === "me") {
            e.stopPropagation();
            onMyTouchMove(e.touches[0].clientX, e.touches[0].clientY);
          } else {
            onSwipeMove?.(e.touches[0].clientX, e.touches[0].clientY);
          }
        }
      }}
      onTouchEnd={(e) => {
        if (senderId === "me") { e.stopPropagation(); cancelMyLongPress(); }
        else onSwipeEnd?.();
      }}
      onTouchCancel={(e) => {
        if (senderId === "me") { e.stopPropagation(); cancelMyLongPress(); }
        else onSwipeEnd?.();
      }}
      onMouseDown={(e) => {
        if (senderId === "me") {
          e.stopPropagation();
          startMyLongPress(e.clientX, e.clientY);
        } else {
          onAvatarMouseDown?.(senderId, msgId || "", e.clientX, e.clientY);
        }
      }}
      onMouseUp={senderId === "me" ? cancelMyLongPress : undefined}
      onMouseLeave={senderId === "me" ? cancelMyLongPress : undefined}
      title={longPressTitle}
    >
      {avatarText}
    </div>
  );

  if (!tomatoCount || tomatoCount <= 0) return avatarEl;

  const count = Math.min(tomatoCount, 10);
  return (
    <div className="relative flex items-center justify-center" style={{ height: "36px", width: "36px" }}>
      {avatarEl}
      {Array.from({ length: count }).map((_, i) => {
        const bottomBase = 24;
        const offsetPer = 6;
        const bottomPx = bottomBase + i * offsetPer;
        const jitter = i === 0 ? 0 : (i % 3 - 1) * 0.8;
        const rotate = i === 0 ? 0 : (i % 3 - 1) * 1.5;
        return (
          <img
            key={i}
            src={tomatoImgUrl}
            alt="tomato"
            className="absolute h-3 w-3 object-contain"
            style={{
              bottom: `${bottomPx}px`,
              left: `calc(50% + ${jitter}px)`,
              transform: `translateX(-50%) rotate(${rotate}deg)`,
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
              zIndex: i,
            }}
          />
        );
      })}
    </div>
  );
}

function TomatoAnimation({
  tomato,
  messages,
  view,
}: {
  tomato: TomatoThrow;
  messages: Message[];
  view: ViewSide;
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const animRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const getSide = useCallback((sender: string): "left" | "right" => {
    if (view === "me") {
      return sender === "me" ? "right" : "left";
    } else {
      return sender === "me" ? "left" : "right";
    }
  }, [view]);

  const findAvatarByMsgId = useCallback((msgId: string): { x: number; y: number; width: number; height: number } | null => {
    const msgEl = document.querySelector(`[data-msg-id="${msgId}"]`);
    if (!msgEl) return null;

    const avatarEl = msgEl.querySelector('[data-avatar="true"]') as HTMLElement | null;
    if (!avatarEl) return null;

    const rect = avatarEl.getBoundingClientRect();
    const scrollContainer = document.querySelector(".chat-bg")?.getBoundingClientRect();
    if (!scrollContainer) return null;

    return {
      x: rect.left - scrollContainer.left + rect.width / 2,
      y: rect.top - scrollContainer.top,
      width: rect.width,
      height: rect.height,
    };
  }, [messages]);

  const findLatestMessageAvatar = useCallback((senderId: string): { x: number; y: number; width: number; height: number } | null => {
    const senderMessages = [...messages].reverse().filter((m) => m.sender === senderId && m.type !== "system" && !m.recalled);
    for (const msg of senderMessages) {
      const pos = findAvatarByMsgId(msg.id);
      if (pos) return pos;
    }
    return null;
  }, [messages, findAvatarByMsgId]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // 延迟一帧等待 DOM 渲染完成，尤其是对面刚发消息就扔番茄的场景
    const startAnim = () => {
      const throwerPos = findLatestMessageAvatar(tomato.throwerId);

      let targetPos: { x: number; y: number; width: number; height: number } | null = null;
      if (tomato.targetMsgId) {
        targetPos = findAvatarByMsgId(tomato.targetMsgId);
      }
      if (!targetPos) {
        targetPos = findLatestMessageAvatar(tomato.targetId);
      }

      if (!throwerPos || !targetPos) {
        setPos(null);
        return;
      }

      const startX = throwerPos.x;
      const startY = throwerPos.y - throwerPos.height * 0.25;
      const endX = targetPos.x;
      const endY = targetPos.y + targetPos.height * 0.25;

      setPos({ x: startX, y: startY });

      const duration = 600;
      const startTime = performance.now();
      const arcHeight = Math.max(60, Math.abs(endY - startY) * 0.8 + 40);

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);

        const x = startX + (endX - startX) * t;
        const y = startY + (endY - startY) * t - arcHeight * 4 * t * (1 - t);

        setPos({ x, y });

        if (t < 1) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          setPos(null);
        }
      };

      animRef.current = requestAnimationFrame(animate);
    };

    const raf = requestAnimationFrame(startAnim);

    return () => {
      cancelAnimationFrame(raf);
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [tomato.id]);

  const tomatoImg = "https://i.postimg.cc/ZKVRS4kH/retouch-2026071501420750.png";

  if (!pos) return null;

  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-30 h-full w-full"
    >
      <div
        className="absolute"
        style={{
          left: `${pos.x - 6}px`,
          top: `${pos.y - 12}px`,
          width: "12px",
          height: "12px",
          transform: "scale(1)",
          opacity: 1,
          transition: "none",
          filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.25))",
          zIndex: 100,
        }}
      >
        <img
          src={tomatoImg}
          alt="tomato"
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}

function SystemMessage({ message, onToggleCollapse, collapsed }: { message: Message; onToggleCollapse?: () => void; collapsed?: boolean }) {
  const isTomatoMsg = message.systemText?.includes("番茄") || message.systemText?.includes("扔了");
  
  return (
    <div className="flex justify-center py-2">
      <span
        className={`px-3 py-1 text-xs rounded-full animate-bubbleIn ${onToggleCollapse ? "cursor-pointer hover:opacity-80" : ""}`}
        style={{
          background: "color-mix(in srgb, var(--text) 8%, transparent)",
          color: "color-mix(in srgb, var(--text) 55%, transparent)",
        }}
        onClick={onToggleCollapse}
      >
        {isTomatoMsg && collapsed ? "🍅 番茄大战（点击展开/收起）" : message.systemText}
        {isTomatoMsg && !collapsed && " 🍅"}
      </span>
    </div>
  );
}

function MessageBubble({
  message,
  side,
  bubbleStyle,
  renderTextWithMention,
  isNew,
}: {
  message: Message;
  side: "left" | "right";
  bubbleStyle: React.CSSProperties;
  renderTextWithMention: (text: string, mentionTarget?: string) => React.ReactNode;
  isNew: boolean;
}) {
  const isLeft = side === "left";
  const bgColor = isLeft ? "var(--her-card)" : "var(--my-bubble)";
  const textColor = isLeft ? "var(--text)" : "var(--my-bubble-text)";
  const isCuteMoe = useAppStore((s) => s.beauty.themeId) === "cute-moe";
  const songs = useAppStore((s) => s.songs);
  const setMusicCurrentIndex = useAppStore((s) => s.setMusicCurrentIndex);
  const setMusicPlaying = useAppStore((s) => s.setMusicPlaying);
  const setMusicFullScreen = useAppStore((s) => s.setMusicFullScreen);
  const time = new Date(message.timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePlayMusic = () => {
    if (!message.music) return;
    const idx = songs.findIndex((s) => s.title === message.music!.title && s.url === message.music!.url);
    if (idx >= 0) {
      setMusicCurrentIndex(idx);
    }
    setMusicPlaying(true);
    setMusicFullScreen(true);
  };

  if (message.type === "image" && message.image) {
    return (
      <div className="flex flex-col items-start max-w-[70%]">
        <img
          src={message.image}
          alt="image"
          className="animate-bubbleIn rounded-2xl border object-cover"
          style={{
            maxWidth: "100%",
            maxHeight: "280px",
            borderColor: "var(--card-border)",
          }}
        />
        <span className="mt-1 px-1 text-[10px]" style={{ color: "color-mix(in srgb, var(--text) 50%, transparent)" }}>
          {time}
        </span>
      </div>
    );
  }

  if (message.type === "sticker") {
    return (
      <div className={`flex flex-col ${isLeft ? "items-start" : "items-end"} max-w-[70%]`}>
        {message.moodTag && (
          <span
            className="mb-1 ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px]"
            style={{
              background: "color-mix(in srgb, var(--accent) 15%, transparent)",
              color: "var(--accent)",
              border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
            }}
          >
            💭 {message.moodTag}
          </span>
        )}
        {message.sticker ? (
          <img
            src={message.sticker}
            alt="sticker"
            className="max-h-32 max-w-full animate-bubbleIn rounded-xl object-contain"
          />
        ) : (
          <div
            className="animate-bubbleIn rounded-xl px-4 py-2.5 text-[15px]"
            style={{ background: bgColor, color: "var(--text-soft)" }}
          >
            [表情包]
          </div>
        )}
        <span className="mt-1 px-1 text-[10px]" style={{ color: "color-mix(in srgb, var(--text) 50%, transparent)" }}>
          {time}
        </span>
      </div>
    );
  }

  if (message.type === "music" && message.music) {
    return (
      <div className="flex flex-col items-start max-w-[75%]">
        <div
          onClick={handlePlayMusic}
          className="animate-bubbleIn cursor-pointer rounded-2xl border p-3 w-full transition hover:opacity-90 active:scale-[0.98]"
          style={{
            background: bgColor,
            borderColor: "color-mix(in srgb, var(--card-border) 50%, transparent)",
          }}
        >
          {message.text && (
            <div className="mb-2 text-[13px]" style={{ color: "var(--text)" }}>
              {message.text}
            </div>
          )}
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl cute-music-btn"
              style={{ background: isCuteMoe ? "transparent" : "color-mix(in srgb, var(--accent) 20%, transparent)", color: isCuteMoe ? "transparent" : "var(--accent)" }}
            >
              <Music className="h-6 w-6" style={{ opacity: isCuteMoe ? 0 : 1 }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>
                {message.music.title}
              </div>
              <div className="mt-1 text-[11px]" style={{ color: "color-mix(in srgb, var(--text) 55%, transparent)" }}>
                点击一起听
              </div>
            </div>
          </div>
        </div>
        <span className="mt-1 px-1 text-[10px]" style={{ color: "color-mix(in srgb, var(--text) 50%, transparent)" }}>
          {time}
        </span>
      </div>
    );
  }

  return (
    <>
      {message.quoteText && (
        <div
          className="animate-bubbleIn mb-1 rounded-lg border-l-2 px-2.5 py-1.5 text-[13px]"
          style={{
            background: "color-mix(in srgb, var(--accent) 15%, transparent)",
            borderColor: "var(--accent)",
            color: "var(--text)",
          }}
        >
          <div className="text-[11px] font-semibold mb-0.5" style={{ color: "var(--accent)" }}>
            {message.quoteSender === "me" ? "我" : "对方"}
          </div>
          <div className="line-clamp-3 leading-snug opacity-90">{message.quoteText}</div>
        </div>
      )}
      <div className="relative animate-bubbleIn" style={{ maxWidth: "100%", minHeight: "36px" }}>
        <div
          style={{
            ...bubbleStyle,
            background: bgColor,
            color: textColor,
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
          className={`px-3 py-[0.4em] text-[15px] leading-relaxed message-bubble ${isLeft ? "message-received" : "message-sent"}`}
        >
          {message.text && renderTextWithMention(message.text, message.mentionTarget)}
        </div>
      </div>
      {message.moodNote && (
        <div
          className="mt-1 animate-bubbleIn text-[11px]"
          style={{ color: "color-mix(in srgb, var(--text-soft) 80%, transparent)" }}
        >
          🌸 心情 · {message.moodNote}
        </div>
      )}
      <span className="mt-0.5 px-1 text-[10px]" style={{ color: "color-mix(in srgb, var(--text) 50%, transparent)" }}>
        {time}
      </span>
    </>
  );
}

function RPSBubble({
  message,
  side,
  getContactName,
  getAvatarText,
  getAvatarImage,
  bubbleStyle,
}: {
  message: Message;
  side: "left" | "right";
  getContactName: (id: string) => string;
  getAvatarText: (id: string) => string;
  getAvatarImage: (id: string) => string;
  bubbleStyle: React.CSSProperties;
}) {
  const isLeft = side === "left";
  const rps = message.rps!;
  const time = new Date(message.timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const choiceEmoji = (choice?: string) => {
    switch (choice) {
      case "rock": return "✊";
      case "paper": return "✋";
      case "scissors": return "✌️";
      default: return "❓";
    }
  };

  const resultText = () => {
    if (rps.result === "win") return "你赢了！";
    if (rps.result === "lose") return "你输了";
    return "平局";
  };

  const resultColor = () => {
    if (rps.result === "win") return "var(--accent)";
    if (rps.result === "lose") return "color-mix(in srgb, var(--text) 50%, transparent)";
    return "color-mix(in srgb, var(--text) 70%, transparent)";
  };

  return (
    <div className={`flex items-center gap-2 ${isLeft ? "justify-start" : "justify-end"}`}>
      {isLeft && (
        <div className="flex w-9 shrink-0 justify-center">
          <MessageAvatar
            senderId={message.sender}
            avatarText={getAvatarText(message.sender)}
            avatarImage={getAvatarImage(message.sender)}
          />
        </div>
      )}
      <div className={`flex flex-col ${isLeft ? "items-start" : "items-end"} max-w-[78%]`}>
        <div
          className="animate-bubbleIn px-4 py-3"
          style={{
            ...bubbleStyle,
            background: isLeft ? "var(--her-card)" : "var(--my-bubble)",
            color: isLeft ? "var(--text)" : "var(--my-bubble-text)",
            minWidth: "200px",
          }}
        >
          <div className="text-sm mb-2 font-medium">猜拳对战</div>
          <div className="flex items-center justify-around gap-4 mb-2">
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-1">{choiceEmoji(rps.challengerChoice)}</div>
              <span className="text-xs" style={{ color: "color-mix(in srgb, var(--text) 60%, transparent)" }}>
                {getContactName(rps.challenger)}
              </span>
            </div>
            <div className="text-lg font-bold" style={{ color: "color-mix(in srgb, var(--text) 40%, transparent)" }}>
              VS
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-1">{choiceEmoji(rps.targetChoice)}</div>
              <span className="text-xs" style={{ color: "color-mix(in srgb, var(--text) 60%, transparent)" }}>
                {getContactName(rps.target)}
              </span>
            </div>
          </div>
          <div className="text-center text-sm font-medium" style={{ color: resultColor() }}>
            {resultText()}
          </div>
        </div>
        <span className="mt-0.5 px-1 text-[10px]" style={{ color: "color-mix(in srgb, var(--text) 50%, transparent)" }}>
          {time}
        </span>
      </div>
      {!isLeft && (
        <div className="flex w-9 shrink-0 justify-center">
          <MessageAvatar
            senderId={message.sender}
            avatarText={getAvatarText(message.sender)}
            avatarImage={getAvatarImage(message.sender)}
          />
        </div>
      )}
    </div>
  );
}

function PollBubble({
  message,
  side,
  getContactName,
  getAvatarText,
  getAvatarImage,
  bubbleStyle,
}: {
  message: Message;
  side: "left" | "right";
  getContactName: (id: string) => string;
  getAvatarText: (id: string) => string;
  getAvatarImage: (id: string) => string;
  bubbleStyle: React.CSSProperties;
}) {
  const isLeft = side === "left";
  const poll = message.poll!;
  const time = new Date(message.timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);

  const getVotersForOption = (optionIndex: number): string[] => {
    return Object.entries(poll.voters)
      .filter(([_, choice]) => choice === optionIndex)
      .map(([id]) => getContactName(id));
  };

  return (
    <div className={`flex items-center gap-2 ${isLeft ? "justify-start" : "justify-end"}`}>
      {isLeft && (
        <div className="flex w-9 shrink-0 justify-center">
          <MessageAvatar
            senderId={message.sender}
            avatarText={getAvatarText(message.sender)}
            avatarImage={getAvatarImage(message.sender)}
          />
        </div>
      )}
      <div className={`flex flex-col ${isLeft ? "items-start" : "items-end"} max-w-[78%]`}>
        <div
          className="animate-bubbleIn px-4 py-3"
          style={{
            ...bubbleStyle,
            background: isLeft ? "var(--her-card)" : "var(--my-bubble)",
            color: isLeft ? "var(--text)" : "var(--my-bubble-text)",
            minWidth: "240px",
          }}
        >
          <div className="text-sm font-medium mb-3">📊 {poll.question}</div>
          {poll.options.map((option, idx) => {
            const votes = poll.votes[String(idx)] || 0;
            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            const voters = getVotersForOption(idx);
            return (
              <div key={idx} className="mb-2 last:mb-0">
                <div className="flex justify-between text-sm mb-1">
                  <span>{option}</span>
                  <span style={{ color: "color-mix(in srgb, var(--text) 60%, transparent)" }}>
                    {votes} 票
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "color-mix(in srgb, var(--text) 10%, transparent)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      background: "var(--accent)",
                    }}
                  />
                </div>
                {voters.length > 0 && (
                  <div
                    className="mt-1 text-[11px]"
                    style={{ color: "color-mix(in srgb, var(--text) 50%, transparent)" }}
                  >
                    {voters.join("、")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <span className="mt-0.5 px-1 text-[10px]" style={{ color: "color-mix(in srgb, var(--text) 50%, transparent)" }}>
          {time}
        </span>
      </div>
      {!isLeft && (
        <div className="flex w-9 shrink-0 justify-center">
          <MessageAvatar
            senderId={message.sender}
            avatarText={getAvatarText(message.sender)}
            avatarImage={getAvatarImage(message.sender)}
          />
        </div>
      )}
    </div>
  );
}

function FlippingHint({ side, name }: { side: "left" | "right"; name?: string }) {
  const isLeft = side === "left";
  return (
    <div className={`flex items-center gap-2 ${isLeft ? "justify-start" : "justify-end"}`}>
      {isLeft && <div className="w-9 shrink-0" />}
      <div className="animate-bubbleIn flex flex-col gap-1">
        {name && (
          <span className="px-1 text-xs" style={{ color: "color-mix(in srgb, var(--text) 60%, transparent)" }}>
            {name} 正在输入中...
          </span>
        )}
        <div
          className="flex items-center gap-1.5 px-3.5 py-2"
          style={{ background: "var(--her-card)", borderRadius: "1rem", boxShadow: "0 2px 8px -2px rgba(0,0,0,0.12)" }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:-0.2s]" style={{ background: "var(--accent)" }} />
          <span className="inline-block h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:-0.1s]" style={{ background: "var(--accent)" }} />
          <span className="inline-block h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: "var(--accent)" }} />
        </div>
      </div>
      {!isLeft && <div className="w-9 shrink-0" />}
    </div>
  );
}

function getBubbleStyle(style: string): React.CSSProperties {
  switch (style) {
    case "round":
      return { borderRadius: "1.25rem", boxShadow: "0 2px 8px -2px rgba(0,0,0,0.15)" };
    case "paper":
      return {
        borderRadius: "0.75rem",
        border: "1px solid var(--card-border)",
        boxShadow: "0 2px 0 rgba(0,0,0,0.06), 0 8px 18px -8px rgba(0,0,0,0.2)",
      };
    case "card":
      return {
        borderRadius: "0.5rem",
        border: "1px solid var(--card-border)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.08)",
      };
    case "cloud":
      return {
        borderRadius: "1.5rem",
        boxShadow: "0 2px 10px -3px rgba(0,0,0,0.18)",
      };
    case "tail":
      return {
        borderRadius: "1rem",
        boxShadow: "0 1px 6px -2px rgba(0,0,0,0.12)",
      };
    case "minimal":
      return {
        borderRadius: "0.5rem",
        boxShadow: "none",
      };
    case "soft":
      return {
        borderRadius: "1.5rem",
        boxShadow: "0 4px 16px -4px rgba(0,0,0,0.1), 0 0 0 1px color-mix(in srgb, var(--accent) 8%, transparent)",
      };
    case "line":
      return {
        borderRadius: "1.2rem",
        border: "2px dashed color-mix(in srgb, var(--accent) 35%, transparent)",
        boxShadow: "0 2px 8px -3px rgba(0,0,0,0.08)",
      };
    case "stamp":
      return {
        borderRadius: "0.3rem",
        border: "2px solid var(--accent)",
        boxShadow: "inset 0 0 0 1px var(--card), 0 2px 0 rgba(0,0,0,0.1)",
      };
    case "glass":
      return {
        borderRadius: "1.25rem",
        background: "color-mix(in srgb, var(--card) 70%, transparent)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px -5px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)",
        border: "1px solid color-mix(in srgb, var(--card-border) 60%, transparent)",
      };
    case "sketch":
      return {
        borderRadius: "1.1rem 1.3rem 1.2rem 1.4rem",
        border: "2px solid color-mix(in srgb, var(--accent) 50%, transparent)",
        boxShadow: "2px 2px 0 color-mix(in srgb, var(--accent) 25%, transparent)",
        transform: "rotate(-0.3deg)",
      };
    case "neon":
      return {
        borderRadius: "1rem",
        boxShadow: "0 0 10px color-mix(in srgb, var(--accent) 40%, transparent), 0 0 20px color-mix(in srgb, var(--accent) 20%, transparent), inset 0 0 5px color-mix(in srgb, var(--accent) 15%, transparent)",
        border: "1px solid color-mix(in srgb, var(--accent) 50%, transparent)",
      };
    case "bubble":
      return {
        borderRadius: "1.5rem",
        boxShadow: "inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -2px 0 rgba(0,0,0,0.08), 0 4px 12px -3px rgba(0,0,0,0.15)",
        border: "1px solid color-mix(in srgb, var(--card-border) 50%, transparent)",
      };
    default:
      return { borderRadius: "1rem" };
  }
}
