import type { PhoneAppId } from "../PhoneTabs";
import { useAppStore } from "@/store/app";
import { ChevronLeft } from "lucide-react";

interface AppItem {
  id: PhoneAppId;
  name: string;
  Icon: (p: { color: string }) => JSX.Element;
  color: string;
}

interface Props {
  apps: AppItem[];
  onOpen: (id: PhoneAppId) => void;
}

export default function HomeScreen({ apps, onOpen }: Props) {
  const contacts = useAppStore((s) => s.contacts);
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const contactId = activeConv?.type === "private" ? activeConv.memberIds[0] : contacts[0]?.id;
  const contact = contacts.find((c) => c.id === contactId);

  if (!contact) return null;
  const herStatus = contact.status;

  return (
    <div className="px-5 pb-4">
      {/* 时钟小组件 */}
      <div
        className="mb-5 rounded-3xl p-4"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--accent) 20%, transparent) 0%, color-mix(in srgb, var(--accent) 5%, transparent) 100%)",
        }}
      >
        <div
          className="font-serif text-3xl font-bold tracking-wide"
          style={{ color: "var(--text)" }}
        >
          {new Date().toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="text-[11px]" style={{ color: "var(--text-soft)" }}>
          {new Date().toLocaleDateString("zh-CN", {
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px]" style={{ color: "var(--text-soft)" }}>
          <span>{herStatus.travel.weather}</span>
          <span>·</span>
          <span>{herStatus.travel.temperature}°C</span>
        </div>
      </div>

      {/* 心情小组件 */}
      <div
        className="mb-5 rounded-2xl p-3"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{herStatus.mood.emoji}</span>
          <div>
            <div
              className="font-serif text-sm font-bold"
              style={{ color: "var(--text)" }}
            >
              {herStatus.mood.current}
            </div>
            <div className="text-[10px]" style={{ color: "var(--text-soft)" }}>
              心情值 {Math.round(herStatus.mood.level)} / 100
            </div>
          </div>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-deep)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${herStatus.mood.level}%`, background: "var(--accent)" }}
          />
        </div>
      </div>

      {/* 应用图标网格 */}
      <div className="grid grid-cols-4 gap-3">
        {apps.map((a) => {
          const Comp = a.Icon;
          return (
            <button
              key={a.id}
              onClick={() => onOpen(a.id)}
              className="flex flex-col items-center gap-1 transition active:scale-90"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${a.color}22, ${a.color}0d)`,
                }}
              >
                <Comp color={a.color} />
              </div>
              <span
                className="text-[10px]"
                style={{ color: "var(--text)" }}
              >
                {a.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AppHeader({
  title,
  onBack,
}: {
  title: string;
  onBack?: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 border-b px-4 py-2.5"
      style={{ borderColor: "var(--card-border)" }}
    >
      {onBack && (
        <button
          onClick={onBack}
          className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-black/5"
          style={{ color: "var(--text-soft)" }}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      <span
        className="font-serif text-sm font-bold"
        style={{ color: "var(--text)" }}
      >
        {title}
      </span>
    </div>
  );
}
