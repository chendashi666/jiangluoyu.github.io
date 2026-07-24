import { X, Mail } from "lucide-react";
import { useAppStore } from "@/store/app";
import { useMemo } from "react";

interface MailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
}

export default function MailboxModal({ isOpen, onClose, contactId }: MailboxModalProps) {
  const memos = useAppStore((s) => s.memos);
  const contacts = useAppStore((s) => s.contacts);

  const contact = useMemo(
    () => contacts.find((c) => c.id === contactId),
    [contacts, contactId]
  );

  // 只显示对方回复的内容（信箱内容）
  const mailboxItems = useMemo(() => {
    return memos
      .filter((m) => m.contactId === contactId && m.from !== "me")
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [memos, contactId]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${month}月${day}日 ${hours}:${minutes}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative flex w-[90%] max-w-sm flex-col animate-popIn rounded-2xl border shadow-2xl"
        style={{
          borderColor: "var(--card-border)",
          background: "var(--card)",
          maxHeight: "80vh",
          height: "28rem",
        }}
      >
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--card-border)" }}>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
              {contact?.name || "对方"}的信箱
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/10"
            style={{ color: "var(--text-soft)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto fancy-scroll px-4 py-3">
          {mailboxItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2" style={{ color: "var(--text-soft)" }}>
              <Mail className="h-10 w-10 opacity-30" />
              <div className="text-sm">暂无来信</div>
            </div>
          ) : (
            <div className="space-y-3">
              {mailboxItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border p-3"
                  style={{
                    borderColor: "var(--card-border)",
                    background: "var(--bg)",
                  }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                      {contact?.name || "对方"}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-soft)" }}>
                      {formatTime(item.timestamp)}
                    </span>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
