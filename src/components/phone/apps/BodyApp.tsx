import { AppHeader } from "./HomeScreen";
import { useAppStore } from "@/store/app";
import { Thermometer, Heart, Moon, Activity } from "lucide-react";

export default function BodyApp({ onBack }: { onBack: () => void }) {
  const contacts = useAppStore((s) => s.contacts);
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const contactId = activeConv?.type === "private" ? activeConv.memberIds[0] : contacts[0]?.id;
  const contact = contacts.find((c) => c.id === contactId);

  if (!contact) return null;
  const body = contact.status.body;

  return (
    <div>
      <AppHeader title="身体状况" onBack={onBack} />
      <div className="flex flex-col gap-2 px-3 py-3">
        <div className="grid grid-cols-2 gap-2">
          <StatCard icon={<Thermometer className="h-3.5 w-3.5" />} label="体温" value={`${body.temp.toFixed(1)}°C`} />
          <StatCard icon={<Heart className="h-3.5 w-3.5" />} label="心率" value={`${Math.round(body.heartRate)} bpm`} accent />
          <StatCard icon={<Moon className="h-3.5 w-3.5" />} label="睡眠" value={`${body.sleepHours.toFixed(1)} h`} />
          <StatCard icon={<Activity className="h-3.5 w-3.5" />} label="疲惫度" value={`${Math.round(body.fatigue)}%`} />
        </div>

        <div
          className="rounded-xl p-3"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        >
          <div className="mb-1 text-[11px]" style={{ color: "var(--text-soft)" }}>
            心率趋势
          </div>
          <div className="spark-grid rounded-md p-1">
            <MiniLine data={body.heartRateHistory} color="var(--accent)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-2.5"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
    >
      <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-soft)" }}>
        {icon} {label}
      </div>
      <div
        className="mt-0.5 font-serif text-base font-bold"
        style={{ color: accent ? "var(--accent)" : "var(--text)" }}
      >
        {value}
      </div>
    </div>
  );
}

function MiniLine({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const w = 100, h = 28;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-full" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
