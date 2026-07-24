import { AppHeader } from "./HomeScreen";
import { useAppStore } from "@/store/app";
import { MapPin, CloudSun, Navigation } from "lucide-react";

export default function TravelApp({ onBack }: { onBack: () => void }) {
  const contacts = useAppStore((s) => s.contacts);
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const contactId = activeConv?.type === "private" ? activeConv.memberIds[0] : contacts[0]?.id;
  const contact = contacts.find((c) => c.id === contactId);

  if (!contact) return null;
  const travel = contact.status.travel;

  return (
    <div>
      <AppHeader title="出行" onBack={onBack} />
      <div className="flex flex-col gap-3 px-3 py-3">
        {/* 地图位置卡 */}
        <div
          className="relative overflow-hidden rounded-2xl p-3"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--accent) 20%, transparent), transparent)",
            border: "1px solid var(--card-border)",
          }}
        >
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-soft)" }}>
              <MapPin className="h-3 w-3" /> 当前位置
            </div>
            <div
              className="mt-0.5 font-serif text-base font-bold"
              style={{ color: "var(--text)" }}
            >
              {travel.location}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <CloudSun className="h-5 w-5" style={{ color: "#D97706" }} />
              <span className="text-[12px]" style={{ color: "var(--text)" }}>
                {travel.weather}
              </span>
              <span className="text-[12px]" style={{ color: "var(--text-soft)" }}>
                {travel.temperature}°C
              </span>
              <Navigation className="ml-auto h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
            </div>
          </div>
        </div>

        {/* 今日行程 */}
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        >
          <div className="mb-2 text-[11px]" style={{ color: "var(--text-soft)" }}>
            今日行程
          </div>
          <ul className="flex flex-col gap-2">
            {travel.schedule.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="flex flex-col items-center">
                  <span
                    className="font-stamp text-[11px]"
                    style={{ color: "var(--accent)" }}
                  >
                    {s.time}
                  </span>
                  {i < travel.schedule.length - 1 && (
                    <span className="mt-0.5 h-6 w-px" style={{ background: "var(--card-border)" }} />
                  )}
                </div>
                <div className="pb-0.5">
                  <div className="text-[12px]" style={{ color: "var(--text)" }}>
                    {s.place}
                  </div>
                  {s.note && (
                    <div className="text-[10px]" style={{ color: "var(--text-soft)" }}>
                      {s.note}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
