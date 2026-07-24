import React, { useState, useMemo } from "react";
import { X, Send } from "lucide-react";
import { useAppStore } from "@/store/app";

interface MemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
}

/**
 * 备忘录弹窗组件
 * - 显示当前联系人的备忘录列表（按时间倒序）
 * - 可添加新的备忘录（写给对方的注意事项）
 * - 显示对方通过信箱回复的备忘录
 */
export default function MemoModal({ isOpen, onClose, contactId }: MemoModalProps) {
  const memos = useAppStore((s) => s.memos);
  const contacts = useAppStore((s) => s.contacts);
  const addMemo = useAppStore((s) => s.addMemo);
  const myName = useAppStore((s) => s.beauty.myName);

  const [inputText, setInputText] = useState("");

  // 获取当前联系人信息
  const contact = useMemo(
    () => contacts.find((c) => c.id === contactId),
    [contacts, contactId]
  );

  // 过滤当前联系人的备忘录并按时间倒序排列
  const contactMemos = useMemo(() => {
    return memos
      .filter((m) => m.contactId === contactId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [memos, contactId]);

  // 格式化时间显示
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${month}月${day}日 ${hours}:${minutes}`;
  };

  // 获取发送者显示名称
  const getSenderName = (from: string) => {
    if (from === "me") return myName || "我";
    return contact?.name || "对方";
  };

  // 提交新备忘录
  const handleSubmit = () => {
    const text = inputText.trim();
    if (!text) return;
    addMemo(contactId, text);
    setInputText("");
  };

  // 按回车键发送
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* 弹窗内容 */}
      <div
        className="relative flex w-[90%] max-w-sm flex-col animate-popIn rounded-2xl border shadow-2xl"
        style={{
          borderColor: "var(--card-border)",
          background: "var(--card)",
          maxHeight: "80vh",
          height: "28rem",
        }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--card-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
            备忘录
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/10"
            style={{ color: "var(--text-soft)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 备忘录列表 */}
        <div className="flex-1 overflow-y-auto fancy-scroll px-4 py-3">
          {contactMemos.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm" style={{ color: "var(--text-soft)" }}>
              暂无备忘录
            </div>
          ) : (
            <div className="space-y-3">
              {contactMemos.map((memo) => {
                const isMe = memo.from === "me";
                return (
                  <div
                    key={memo.id}
                    className="rounded-xl border p-3"
                    style={{
                      borderColor: "var(--card-border)",
                      background: isMe ? "var(--my-bubble)" : "var(--bg)",
                    }}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                        {getSenderName(memo.from)}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-soft)" }}>
                        {formatTime(memo.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                      {memo.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部输入区 */}
        <div
          className="flex items-center gap-2 border-t px-4 py-3"
          style={{ borderColor: "var(--card-border)" }}
        >
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="写一条备忘录..."
            className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none"
            style={{
              borderColor: "var(--card-border)",
              background: "var(--bg)",
              color: "var(--text)",
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!inputText.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition disabled:opacity-40"
            style={{ background: "var(--accent)" }}
          >
            <Send className="h-4 w-4" style={{ color: "var(--card)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
