import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, X, ChevronLeft, Minimize2 } from "lucide-react";
import { useAppStore } from "@/store/app";

interface Props {
  onBack: () => void;
}

export default function PhoneApp({ onBack }: Props) {
  const callRecords = useAppStore((s) => s.callRecords);
  const contacts = useAppStore((s) => s.contacts);
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const setFloatingPhone = useAppStore((s) => s.setFloatingPhone);
  const setPhoneOpen = useAppStore((s) => s.setPhoneOpen);

  const handleMinimize = () => {
    const conv = conversations.find((c) => c.id === activeConversationId);
    const cid =
      conv && conv.type === "private" && conv.memberIds[0]
        ? conv.memberIds[0]
        : contacts[0]?.id;
    if (cid) {
      setFloatingPhone(true, cid);
      setPhoneOpen(false);
    }
  };

  const getContactAvatar = (contactId: string) => {
    return contacts.find((c) => c.id === contactId)?.avatar || "他";
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    if (days === 1) return "昨天";
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: "var(--card-border)" }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-black/5"
            style={{ color: "var(--text-soft)" }}
            aria-label="返回"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span
            className="font-serif text-sm font-bold"
            style={{ color: "var(--text)" }}
          >
            通话记录
          </span>
        </div>
        <button
          onClick={handleMinimize}
          className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-black/5"
          style={{ color: "var(--text-soft)" }}
          aria-label="最小化"
        >
          <Minimize2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {callRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: "var(--text-soft)" }}>
            <Phone className="h-10 w-10 mb-3 opacity-30" />
            <div className="text-sm">暂无通话记录</div>
          </div>
        ) : (
          <div className="space-y-2">
            {callRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-3 rounded-xl border p-3"
                style={{ borderColor: "var(--card-border)", background: "var(--card)" }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: "var(--her-card)" }}>
                  {record.direction === "incoming" ? "来电" : getContactAvatar(record.contactId)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {record.status === "rejected" && <X className="h-3.5 w-3.5" style={{ color: "#E74C3C" }} />}
                    {record.status === "connected" && record.direction === "outgoing" && (
                      <PhoneOutgoing className="h-3.5 w-3.5" style={{ color: "#2ECC71" }} />
                    )}
                    {record.status === "connected" && record.direction === "incoming" && (
                      <PhoneIncoming className="h-3.5 w-3.5" style={{ color: "#2ECC71" }} />
                    )}
                    {record.status === "missed" && <PhoneMissed className="h-3.5 w-3.5" style={{ color: "#E74C3C" }} />}
                    <span className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                      {record.contactName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px]" style={{ color: "var(--text-soft)" }}>
                      {record.status === "rejected" ? "已挂断" : record.status === "missed" ? "未接" : formatDuration(record.duration)}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] shrink-0" style={{ color: "var(--text-soft)" }}>
                  {formatTime(record.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
