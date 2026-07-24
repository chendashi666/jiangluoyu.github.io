import { useAppStore } from "@/store/app";

const APPS = [
  { id: "chat", icon: "💬", name: "聊天" },
  { id: "body", icon: "❤️", name: "身体" },
  { id: "mood", icon: "🌸", name: "心情" },
  { id: "work", icon: "💼", name: "工作" },
  { id: "travel", icon: "🚇", name: "出行" },
  { id: "tomato", icon: "🍅", name: "番茄计数器" },
];

export default function PhoneAppPanel() {
  const contacts = useAppStore((s) => s.contacts);
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const contactId = activeConv?.type === "private" ? activeConv.memberIds[0] : contacts[0]?.id;
  const contact = contacts.find((c) => c.id === contactId);
  const herStatus = contact?.status;

  if (!herStatus) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="mb-2 font-serif text-sm font-bold" style={{ color: "var(--text)" }}>
            小应用说明
          </h3>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-soft)" }}>
            他的手机里有以下小应用。每个模块的数据会根据对话、时间、概率自动变化。
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {APPS.map((a) => (
            <div
              key={a.id}
              className="flex flex-col items-center gap-1 rounded-xl border p-3"
              style={{
                background: "var(--card)",
                borderColor: "var(--card-border)",
              }}
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-[11px] font-medium" style={{ color: "var(--text)" }}>
                {a.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-2 font-serif text-sm font-bold" style={{ color: "var(--text)" }}>
          小应用说明
        </h3>
        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-soft)" }}>
          他的手机里有以下小应用。每个模块的数据会根据对话、时间、概率自动变化。
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {APPS.map((a) => (
          <div
            key={a.id}
            className="flex flex-col items-center gap-1 rounded-xl border p-3"
            style={{
              background: "var(--card)",
              borderColor: "var(--card-border)",
            }}
          >
            <span className="text-2xl">{a.icon}</span>
            <span className="text-[11px] font-medium" style={{ color: "var(--text)" }}>
              {a.name}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-3" style={{ borderColor: "var(--card-border)", background: "var(--card)" }}>
        <h4 className="mb-2 text-[12px] font-medium" style={{ color: "var(--text)" }}>
          当前状态速览
        </h4>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <Info label="心情" value={herStatus.mood.current + " " + herStatus.mood.emoji} />
          <Info label="心情值" value={`${Math.round(herStatus.mood.level)} / 100`} />
          <Info label="疲惫度" value={`${Math.round(herStatus.body.fatigue)}%`} />
          <Info label="工作状态" value={
            herStatus.work.status === "working"
              ? "工作中"
              : herStatus.work.status === "resting"
                ? "休息中"
                : "下班"
          } />
          <Info label="工作内容" value={herStatus.work.content} />
          <Info label="位置" value={herStatus.travel.location} />
        </div>
      </div>

      <div className="rounded-xl border p-3 text-[11px] leading-relaxed" style={{ borderColor: "var(--card-border)", background: "var(--card)", color: "var(--text-soft)" }}>
        <p className="mb-1">💡 小贴士：</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>偷看手机有 10% 概率被他发现</li>
          <li>他的身体状态约 30% 概率在 1-4 小时内更新</li>
          <li>心情 11% 概率标注在回复的字卡上</li>
          <li>当他生气时，会弹出提醒</li>
          <li>字卡可以在「字卡库」中自由管理</li>
        </ul>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px]" style={{ color: "var(--text-soft)" }}>{label}</span>
      <span className="font-medium truncate" style={{ color: "var(--text)" }}>{value}</span>
    </div>
  );
}
