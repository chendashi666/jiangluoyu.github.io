import { useState } from "react";
import { AppHeader } from "./HomeScreen";
import { useAppStore } from "@/store/app";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MEAL_INFO: Record<string, { label: string; emoji: string; color: string }> = {
  breakfast: { label: "早饭", emoji: "🍳", color: "#FFB74D" },
  lunch: { label: "午饭", emoji: "🍱", color: "#81C784" },
  dinner: { label: "晚饭", emoji: "🍜", color: "#BA68C8" },
};

export default function MealsApp({ onBack }: { onBack: () => void }) {
  const contacts = useAppStore((s) => s.contacts);
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const updateContact = useAppStore((s) => s.updateContact);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const contactId = activeConv?.type === "private" ? activeConv.memberIds[0] : contacts[0]?.id;
  const contact = contacts.find((c) => c.id === contactId);

  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );

  if (!contact) return null;
  const meals = contact.status.meals;

  const { year, month } = viewMonth;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const cells: { date: string | null; day: number | null }[] = [];
  for (let i = 0; i < firstDay; i++) cells.push({ date: null, day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date: dateStr, day: d });
  }

  const getDayMeals = (date: string) => meals.filter((m) => m.date === date);
  const selectedMeals = getDayMeals(selectedDate);

  const prevMonth = () => {
    if (month === 0) setViewMonth({ year: year - 1, month: 11 });
    else setViewMonth({ year, month: month - 1 });
  };
  const nextMonth = () => {
    if (month === 11) setViewMonth({ year: year + 1, month: 0 });
    else setViewMonth({ year, month: month + 1 });
  };

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="三餐记录" onBack={onBack} />

      <div className="fancy-scroll flex-1 overflow-y-auto px-3 py-2">
        {/* 米饭小游戏 */}
        <RiceGame contactId={contactId!} />

        {/* 日历头部 */}
        <div
          className="mb-2 mt-3 flex items-center justify-between rounded-xl px-2 py-1.5"
          style={{ background: "color-mix(in srgb, var(--accent) 8%, transparent)" }}
        >
          <button
            onClick={prevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg active:scale-90"
            style={{ color: "var(--accent)" }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[12px] font-bold" style={{ color: "var(--accent)" }}>
            {year}年{month + 1}月
          </span>
          <button
            onClick={nextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg active:scale-90"
            style={{ color: "var(--accent)" }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* 星期标题 */}
        <div className="mb-1 grid grid-cols-7 text-center text-[9px]" style={{ color: "var(--text-soft)" }}>
          <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
        </div>

        {/* 日历格子 */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell.date) return <div key={i} className="h-9" />;
            const dayMeals = getDayMeals(cell.date);
            const isToday = cell.date === todayStr;
            const isSelected = cell.date === selectedDate;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(cell.date!)}
                className="flex h-9 flex-col items-center justify-center rounded-lg text-[10px] transition active:scale-95"
                style={{
                  background: isSelected
                    ? "var(--accent)"
                    : isToday
                    ? "color-mix(in srgb, var(--accent) 18%, transparent)"
                    : "transparent",
                  color: isSelected ? "var(--card)" : "var(--text)",
                  fontWeight: isToday || isSelected ? 700 : 400,
                }}
              >
                <span>{cell.day}</span>
                {dayMeals.length > 0 && (
                  <div className="flex gap-0.5">
                    {dayMeals.map((m) => (
                      <span
                        key={m.meal}
                        className="h-1 w-1 rounded-full"
                        style={{
                          background: isSelected ? "var(--card)" : MEAL_INFO[m.meal]?.color,
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 选中日期的三餐详情 */}
        <div className="mt-4">
          <h4 className="mb-2 px-1 text-[11px] font-bold" style={{ color: "var(--text)" }}>
            {selectedDate === todayStr ? "今天" : selectedDate} · 吃了什么
          </h4>
          {selectedMeals.length === 0 ? (
            <div
              className="rounded-xl px-4 py-6 text-center text-[11px]"
              style={{
                background: "var(--card)",
                border: "1px dashed var(--card-border)",
                color: "var(--text-soft)",
              }}
            >
              这天还没有记录哦～
            </div>
          ) : (
            <div className="space-y-2">
              {(["breakfast", "lunch", "dinner"] as const).map((meal) => {
                const rec = selectedMeals.find((m) => m.meal === meal);
                const info = MEAL_INFO[meal];
                return (
                  <div
                    key={meal}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--card-border)",
                      opacity: rec ? 1 : 0.4,
                    }}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg"
                      style={{ background: `${info.color}20` }}
                    >
                      {info.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11px] font-bold" style={{ color: "var(--text)" }}>
                          {info.label}
                        </span>
                        <span className="text-[9px]" style={{ color: "var(--text-soft)" }}>
                          {rec?.time || "—"}
                        </span>
                      </div>
                      <div className="truncate text-[11px]" style={{ color: "var(--text-soft)" }}>
                        {rec ? rec.name : "还没吃"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 米饭小游戏组件
function RiceGame({ contactId }: { contactId: string }) {
  const contacts = useAppStore((s) => s.contacts);
  const updateContact = useAppStore((s) => s.updateContact);
  const contact = contacts.find((c) => c.id === contactId);
  const riceFullness = contact?.riceFullness || 0;
  const [floats, setFloats] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleTap = (e: React.MouseEvent<HTMLButtonElement>) => {
    updateContact(contactId, { riceFullness: Math.min(100, riceFullness + 1) });
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    setFloats((f) => [...f, { id, x, y }]);
    setTimeout(() => {
      setFloats((f) => f.filter((fl) => fl.id !== id));
    }, 1200);

    if (Math.random() < 0.4) {
      const state = useAppStore.getState();
      const card = state.pickRandomCard(contactId, "chat");
      if (card) {
        const message = `${contact?.name}回应了我，饿了就快吃饭吧～`;
        if ("Notification" in window && Notification.permission === "granted") {
          try {
            new Notification(contact?.name || "宝宝", {
              body: message,
              icon: contact?.avatarImage || undefined,
            });
          } catch (e) {
            console.log("Notification failed", e);
          }
        }
        document.title = `💬 ${contact?.name}回应了我`;
        setTimeout(() => {
          document.title = "苜蓿";
        }, 5000);
      }
    }
  };

  const riceRemaining = Math.max(0, 100 - riceFullness);

  return (
    <div
      className="rounded-2xl p-3"
      style={{
        background: "linear-gradient(135deg, color-mix(in srgb, #FFB74D 15%, var(--card)) 0%, var(--card) 100%)",
        border: "1px solid var(--card-border)",
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold" style={{ color: "var(--text)" }}>
          🍚 吃米饭
        </span>
        <span className="text-[10px]" style={{ color: "var(--text-soft)" }}>
          饱腹度 {riceFullness}
        </span>
      </div>

      {/* 米饭碗 */}
      <div className="flex flex-col items-center">
        <button
          onClick={handleTap}
          className="relative flex h-24 w-24 items-center justify-center rounded-full transition active:scale-90"
          style={{
            background: "radial-gradient(circle at 50% 40%, #FFF8E1 0%, #FFE0B2 60%, #FFCC80 100%)",
            boxShadow: "0 4px 12px -2px rgba(255,152,0,0.3), inset 0 -3px 0 rgba(0,0,0,0.08)",
          }}
        >
          {/* 米饭粒 */}
          <div className="relative h-16 w-16">
            {Array.from({ length: Math.min(riceRemaining, 30) }).map((_, i) => {
              const angle = (i / 30) * Math.PI * 2;
              const r = 8 + (i % 3) * 10;
              const left = 50 + Math.cos(angle) * r;
              const top = 50 + Math.sin(angle) * r;
              return (
                <div
                  key={i}
                  className="absolute h-1.5 w-2.5 rounded-full"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    transform: "translate(-50%, -50%)",
                    background: "white",
                    opacity: 0.9,
                    boxShadow: "0 0.5px 1px rgba(0,0,0,0.1)",
                  }}
                />
              );
            })}
          </div>

          {/* 浮动文字 */}
          {floats.map((f) => (
            <span
              key={f.id}
              className="pointer-events-none absolute text-[12px] font-bold"
              style={{
                left: f.x,
                top: f.y,
                color: "var(--accent)",
                animation: "floatUp 1.2s ease-out forwards",
              }}
            >
              饱腹度+1
            </span>
          ))}
        </button>

        <div className="mt-2 text-[9px]" style={{ color: "var(--text-soft)" }}>
          点击米饭碗吃饭，对方有40%概率回应
        </div>

        {/* 饱腹度进度条 */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-deep)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(riceFullness, 100)}%`,
              background: "linear-gradient(90deg, #FFB74D, #FF8A65)",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-40px) scale(1.3); }
        }
      `}</style>
    </div>
  );
}
