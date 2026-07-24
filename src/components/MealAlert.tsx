import { X, UtensilsCrossed } from "lucide-react";
import { useAppStore } from "@/store/app";

const MEAL_LABELS: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: "早饭", emoji: "🍳" },
  lunch: { label: "午饭", emoji: "🍱" },
  dinner: { label: "晚饭", emoji: "🍜" },
};

export default function MealAlert() {
  const mealAlert = useAppStore((s) => s.mealAlert);
  const dismiss = useAppStore((s) => s.dismissMealAlert);
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const contacts = useAppStore((s) => s.contacts);
  const beauty = useAppStore((s) => s.beauty);

  if (!mealAlert) return null;

  const conv = conversations.find((c) => c.id === activeConversationId);
  let contactName = beauty.herName || "宝宝";
  if (conv && conv.type === "private" && conv.memberIds[0]) {
    const contact = contacts.find((c) => c.id === conv.memberIds[0]);
    if (contact) contactName = contact.name;
  }

  const info = MEAL_LABELS[mealAlert.meal] || { label: "吃饭", emoji: "🍽️" };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-6">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.25)" }}
        onClick={dismiss}
      />
      <div
        className="relative z-10 w-full max-w-sm animate-bounceIn overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
        }}
      >
        {/* 顶部装饰 */}
        <div
          className="relative h-20"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--accent) 20%, var(--card)) 0%, var(--card) 100%)",
          }}
        >
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg"
              style={{ background: "var(--card)", border: "2px solid var(--accent)" }}
            >
              {info.emoji}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-10 text-center">
          <h3
            className="font-serif text-lg font-bold"
            style={{ color: "var(--text)" }}
          >
            {contactName}更新了{info.label}
          </h3>
          <p
            className="mt-1 text-[13px]"
            style={{ color: "color-mix(in srgb, var(--text) 60%, transparent)" }}
          >
            他今天{info.label}吃的是
          </p>
          <div
            className="mt-3 rounded-xl px-4 py-3"
            style={{
              background:
                "color-mix(in srgb, var(--accent) 8%, transparent)",
              border: "1px solid var(--card-border)",
            }}
          >
            <span
              className="font-serif text-base font-bold"
              style={{ color: "var(--accent)" }}
            >
              {mealAlert.name}
            </span>
          </div>

          <button
            onClick={dismiss}
            className="mt-4 w-full rounded-xl py-2.5 text-[13px] font-medium transition active:scale-98"
            style={{
              background: "var(--accent)",
              color: "var(--card)",
            }}
          >
            知道啦～
          </button>
        </div>

        <button
          onClick={dismiss}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-black/5"
          style={{ color: "var(--text-soft)" }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
