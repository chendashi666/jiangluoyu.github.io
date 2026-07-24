import { useCallback, useEffect, useRef, useState } from "react";
import { PetCanvas } from "./phone/apps/PetApp";
import { useAppStore } from "@/store/app";
import { DEFAULT_PET_CONFIG, type BallPetConfig } from "@/types/pet";

// 简约风格小手图标
function HandIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
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

export default function DesktopPet() {
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const conversations = useAppStore((s) => s.conversations);
  const contacts = useAppStore((s) => s.contacts);
  const patPet = useAppStore((s) => s.patPet);
  const beauty = useAppStore((s) => s.beauty);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const isGroupChat = activeConv?.type === "group";
  const petEnabled = beauty.petEnabled && !isGroupChat;

  const contactId = activeConv?.type === "private" ? activeConv.memberIds[0] : contacts[0]?.id;
  const contact = contacts.find((c) => c.id === contactId);
  const isPetHidden = !!activeConv?.petHidden;
  const setPetHidingMode = useAppStore((s) => s.setPetHidingMode);

  const [petConfig, setPetConfig] = useState<BallPetConfig>(DEFAULT_PET_CONFIG);
  const [patSignal, setPatSignal] = useState(0);

  // 位置（相对于聊天容器，右上角）
  const [pos, setPos] = useState({ x: 16, y: 8 });
  const containerRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const moved = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const longPressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);

  // === 小手拖拽状态 ===
  const [showHand, setShowHand] = useState(false);
  const [handPos, setHandPos] = useState({ x: 0, y: 0 });
  const handActive = useRef(false);

  // === 偷看状态 ===
  const [peeking, setPeeking] = useState<{ side: "left" | "right"; phase: "hidden" | "peeking" | "retreating" } | null>(null);
  const peekTimerRef = useRef<number | null>(null);

  // 随机触发偷看
  const scheduleNextPeek = useCallback(() => {
    if (peekTimerRef.current) window.clearTimeout(peekTimerRef.current);
    const delay = 15000 + Math.random() * 25000;
    peekTimerRef.current = window.setTimeout(() => {
      const side = Math.random() > 0.5 ? "left" : "right";
      setPeeking({ side, phase: "hidden" });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPeeking({ side, phase: "peeking" });
          window.setTimeout(() => {
            setPeeking((p) => p ? { ...p, phase: "retreating" } : null);
            window.setTimeout(() => {
              setPeeking(null);
              scheduleNextPeek();
            }, 800 + Math.random() * 400);
          }, 2500 + Math.random() * 2000);
        });
      });
    }, delay);
  }, []);

  useEffect(() => {
    scheduleNextPeek();
    return () => {
      if (peekTimerRef.current) window.clearTimeout(peekTimerRef.current);
    };
  }, [scheduleNextPeek]);

  // 宠物躲藏时暂停偷看，找到后恢复
  useEffect(() => {
    if (isPetHidden) {
      if (peekTimerRef.current) {
        window.clearTimeout(peekTimerRef.current);
        peekTimerRef.current = null;
      }
      if (peeking) setPeeking(null);
    } else {
      scheduleNextPeek();
    }
  }, [isPetHidden, peeking, scheduleNextPeek]);

  const handlePeekClick = () => {
    if (!peeking || peeking.phase === "retreating") return;
    setPeeking((p) => p ? { ...p, phase: "retreating" } : null);
    if (peekTimerRef.current) window.clearTimeout(peekTimerRef.current);
    peekTimerRef.current = window.setTimeout(() => {
      setPeeking(null);
      scheduleNextPeek();
    }, 600);
  };

  // 加载当前会话的宠物配置（会话独立）
  const loadConfig = (convId: string) => {
    try {
      const saved = localStorage.getItem(`muxu-pet-${convId}`);
      return saved ? { ...DEFAULT_PET_CONFIG, ...JSON.parse(saved) } : { ...DEFAULT_PET_CONFIG };
    } catch {
      return { ...DEFAULT_PET_CONFIG };
    }
  };

  useEffect(() => {
    setPetConfig(loadConfig(activeConversationId));
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

  // 对方随机摸摸（4% 概率 / 每 12 秒）→ 聊天系统消息提醒
  useEffect(() => {
    const id = window.setInterval(() => {
      if (Math.random() < 0.04) {
        setPatSignal((n) => n + 1);
        patPet(activeConversationId, "her");
      }
    }, 12000);
    return () => window.clearInterval(id);
  }, [activeConversationId, patPet]);

  // === 监听头像长按事件 → 启动小手 ===
  useEffect(() => {
    const onLongPress = (e: Event) => {
      const evt = e as CustomEvent;
      handActive.current = true;
      setShowHand(true);
      setHandPos({ x: evt.detail.x, y: evt.detail.y });
    };
    window.addEventListener("avatar-longpress", onLongPress as EventListener);

    // 全局 pointermove 跟随手指
    const onMove = (e: PointerEvent) => {
      if (handActive.current) setHandPos({ x: e.clientX, y: e.clientY });
    };
    // 全局 touchmove → 阻止浏览器滚动（防止 pointercancel 导致小手消失）
    const onTouchMove = (e: TouchEvent) => {
      if (handActive.current && e.touches.length === 1) {
        e.preventDefault();
        setHandPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    };
    // 全局 pointerup → 检查是否在宠物上 → 摸摸
    const onUp = (e: PointerEvent) => {
      if (!handActive.current) return;
      handActive.current = false;
      setShowHand(false);
      const pet = petRef.current;
      if (pet) {
        const r = pet.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          // 摸到了！只触发动画，不推聊天消息
          setPatSignal((n) => n + 1);
        }
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      window.removeEventListener("avatar-longpress", onLongPress as EventListener);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  // 拖拽宠物本体（相对于容器）
  const getContainerRect = () => containerRef.current?.getBoundingClientRect();

  const startDrag = (clientX: number, clientY: number) => {
    const rect = getContainerRect();
    if (!rect) return;
    dragging.current = true;
    moved.current = false;
    longPressFired.current = false;
    offset.current = { x: clientX - rect.left - pos.x, y: clientY - rect.top - pos.y };
    // 长按 800ms 进入躲藏选择模式
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = window.setTimeout(() => {
      if (!moved.current && !isPetHidden) {
        longPressFired.current = true;
        setPetHidingMode(true);
      }
    }, 800);
  };
  const onDrag = (clientX: number, clientY: number) => {
    if (!dragging.current) return;
    const rect = getContainerRect();
    if (!rect) return;
    moved.current = true;
    // 拖动时取消长按
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    const size = 72;
    const maxX = rect.width - size - 8;
    const maxY = rect.height - size - 8;
    setPos({
      x: Math.max(8, Math.min(maxX, clientX - rect.left - offset.current.x)),
      y: Math.max(8, Math.min(maxY, clientY - rect.top - offset.current.y)),
    });
  };
  const endDrag = () => {
    dragging.current = false;
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // 点击宠物 = 摸摸（只动画，不提醒）
  const handleClick = () => {
    if (moved.current || longPressFired.current) return;
    setPatSignal((n) => n + 1);
  };

  if (!petEnabled) return null;

  return (
    <>
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        {!isPetHidden && !peeking && (
          <div
            ref={petRef}
            className="pointer-events-auto absolute select-none"
            style={{
              left: pos.x,
              top: pos.y,
              touchAction: "none",
              transition: dragging.current ? "none" : undefined,
            }}
            onMouseDown={(e) => {
              startDrag(e.clientX, e.clientY);
              const move = (ev: MouseEvent) => onDrag(ev.clientX, ev.clientY);
              const up = () => {
                endDrag();
                window.removeEventListener("mousemove", move);
                window.removeEventListener("mouseup", up);
              };
              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}
            onTouchStart={(e) => {
              const t = e.touches[0];
              startDrag(t.clientX, t.clientY);
              const move = (ev: TouchEvent) => {
                const tt = ev.touches[0];
                onDrag(tt.clientX, tt.clientY);
              };
              const end = () => {
                endDrag();
                window.removeEventListener("touchmove", move);
                window.removeEventListener("touchend", end);
              };
              window.addEventListener("touchmove", move, { passive: true });
              window.addEventListener("touchend", end);
            }}
            onClick={handleClick}
          >
            {/* 透明底宠物本体 */}
            <PetCanvas config={petConfig} size={72} patSignal={patSignal} />
          </div>
        )}

        {/* 偷看的小宠物 */}
        {peeking && !isPetHidden && (
          <div
            className="pointer-events-auto absolute bottom-0 select-none cursor-pointer"
            style={{
              [peeking.side]: 16,
              transform: `translateY(${peeking.phase === "peeking" ? "-8px" : "100%"})`,
              transition: peeking.phase === "hidden" ? "none" : "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onClick={handlePeekClick}
          >
            <div className="overflow-hidden" style={{ height: 38 }}>
              <PetCanvas config={petConfig} size={64} patSignal={0} />
            </div>
          </div>
        )}
      </div>

      {/* 跟随手指的简约小手（独立于 overflow-hidden 容器，确保不被裁剪） */}
      {showHand && (
        <div
          className="pointer-events-none fixed z-[100]"
          style={{ left: handPos.x, top: handPos.y, transform: "translate(-30%, -20%)" }}
        >
          <HandIcon />
        </div>
      )}
    </>
  );
}
