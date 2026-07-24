import { AppHeader } from "./HomeScreen";
import { useAppStore } from "@/store/app";
import { Check } from "lucide-react";

export default function WorkApp({ onBack }: { onBack: () => void }) {
  const contacts = useAppStore((s) => s.contacts);
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const contactId = activeConv?.type === "private" ? activeConv.memberIds[0] : contacts[0]?.id;
  const contact = contacts.find((c) => c.id === contactId);

  if (!contact) return null;
  const work = contact.status.work;
  const statusLabel =
    work.status === "working" ? "工作中" : work.status === "resting" ? "休息中" : "已下班";

  return (
    <div>
      <AppHeader title="工作台" onBack={onBack} />
      <div className="flex flex-col gap-3 px-3 py-3">
        {/* 状态卡 */}
        <div
          className="rounded-2xl p-3"
          style={{
            background:
              work.status === "working"
                ? "linear-gradient(135deg, #7CB34233, #7CB34211)"
                : "var(--card)",
            border: "1px solid var(--card-border)",
          }}
        >
          <div className="text-[11px]" style={{ color: "var(--text-soft)" }}>
            当前状态
          </div>
          <div
            className="font-serif text-lg font-bold"
            style={{ color: "var(--text)" }}
          >
            {statusLabel}
          </div>
          <div className="mt-1 text-[12px]" style={{ color: "var(--text)" }}>
            {work.content}
          </div>
          <div className="mt-1 text-[11px]" style={{ color: "var(--text-soft)" }}>
            📍 {work.location}
          </div>
          {work.overtime && (
            <div
              className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px]"
              style={{ background: "var(--accent)", color: "var(--card)" }}
            >
              加班中
            </div>
          )}
        </div>

        {/* 进度条 */}
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        >
          <div className="flex items-center justify-between text-[11px]">
            <span style={{ color: "var(--text-soft)" }}>今日进度</span>
            <span style={{ color: "var(--accent)" }}>{work.progress}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-deep)" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${work.progress}%`, background: "var(--accent)" }}
            />
          </div>
        </div>

        {/* 任务列表 */}
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        >
          <div className="mb-2 text-[11px]" style={{ color: "var(--text-soft)" }}>
            今日待办
          </div>
          <ul className="flex flex-col gap-1.5">
            {work.tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px]"
                style={{ color: "var(--text)" }}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border`}
                  style={{
                    background: t.done ? "var(--accent)" : "transparent",
                    borderColor: t.done ? "var(--accent)" : "var(--card-border)",
                    color: "var(--card)",
                  }}
                >
                  {t.done && <Check className="h-2.5 w-2.5" />}
                </span>
                <span className={t.done ? "line-through opacity-50" : ""}>{t.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
