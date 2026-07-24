import { AppHeader } from "./HomeScreen";
import { useAppStore } from "@/store/app";

export default function MoodApp({ onBack }: { onBack: () => void }) {
  const contacts = useAppStore((s) => s.contacts);
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const contactId = activeConv?.type === "private" ? activeConv.memberIds[0] : contacts[0]?.id;
  const contact = contacts.find((c) => c.id === contactId);

  if (!contact) return null;
  const mood = contact.status.mood;

  return (
    <div>
      <AppHeader title="心情日记" onBack={onBack} />
      <div className="flex flex-col gap-3 px-3 py-3">
        <div
          className="rounded-2xl p-4 text-center"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        >
          <div className="text-4xl">{mood.emoji}</div>
          <div
            className="mt-1 font-serif text-lg font-bold"
            style={{ color: "var(--text)" }}
          >
            {mood.current}
          </div>
          <div className="text-[11px]" style={{ color: "var(--text-soft)" }}>
            心情值 {Math.round(mood.level)} / 100
          </div>
        </div>

        <div
          className="rounded-xl p-3"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        >
          <div className="mb-2 text-[11px]" style={{ color: "var(--text-soft)" }}>
            今日心情曲线
          </div>
          <div className="spark-grid rounded-md p-1">
            <MoodCurve data={mood.curve} accent="var(--accent)" />
          </div>
        </div>

        <div
          className="rounded-xl p-3"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        >
          <div className="text-[11px]" style={{ color: "var(--text-soft)" }}>
            今日关键词
          </div>
          <div
            className="mt-1 font-stamp text-[15px]"
            style={{ color: "var(--accent)" }}
          >
            「{mood.keyword}」
          </div>
        </div>
      </div>
    </div>
  );
}

function MoodCurve({ data, accent }: { data: number[]; accent: string }) {
  const w = 100, h = 36;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (v / 100) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="moodG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#moodG)" />
      <polyline points={pts} fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
