import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/app";

interface PollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PollModal({ isOpen, onClose }: PollModalProps) {
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const sendPoll = useAppStore((s) => s.sendPoll);
  const themeId = useAppStore((s) => s.beauty.themeId);
  const isCuteMoe = themeId === "cute-moe";

  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const handleOptionChange = (index: number, value: string) => {
    setPollOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddOption = () => {
    if (pollOptions.length >= 10) return;
    setPollOptions((prev) => [...prev, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (pollOptions.length <= 2) return;
    setPollOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendPoll = () => {
    const q = pollQuestion.trim();
    const options = pollOptions.map((o) => o.trim()).filter((o) => o.length > 0);
    if (!q || options.length < 2 || !activeConv) return;
    sendPoll(activeConv.id, q, options);
    setPollQuestion("");
    setPollOptions(["", ""]);
    onClose();
  };

  const validOptionsCount = pollOptions.filter((o) => o.trim().length > 0).length;
  const canSend = pollQuestion.trim().length > 0 && validOptionsCount >= 2;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-[90%] max-w-sm max-h-[85vh] overflow-y-auto animate-popIn rounded-2xl border p-4 shadow-2xl"
        style={{
          borderColor: isCuteMoe ? "rgba(212,184,184,0.4)" : "var(--card-border)",
          background: isCuteMoe ? "rgba(255,255,255,0.95)" : "var(--card)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: isCuteMoe ? "#5F7A8C" : "var(--text)" }}>
            发起投票
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/10"
            style={{ color: isCuteMoe ? "#8BA8B8" : "var(--text-soft)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm" style={{ color: isCuteMoe ? "#8BA8B8" : "var(--text-soft)" }}>
              投票问题
            </label>
            <input
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="输入问题..."
              className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none"
              style={{
                borderColor: isCuteMoe ? "rgba(212,184,184,0.4)" : "var(--card-border)",
                background: isCuteMoe ? "rgba(255,255,255,0.9)" : "var(--bg)",
                color: isCuteMoe ? "#5F7A8C" : "var(--text)",
              }}
            />
          </div>

          {pollOptions.map((option, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <label className="mb-2 block text-sm" style={{ color: isCuteMoe ? "#8BA8B8" : "var(--text-soft)" }}>
                  选项 {index + 1}
                </label>
                <input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder="输入选项..."
                  className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none"
                  style={{
                    borderColor: isCuteMoe ? "rgba(212,184,184,0.4)" : "var(--card-border)",
                    background: isCuteMoe ? "rgba(255,255,255,0.9)" : "var(--bg)",
                    color: isCuteMoe ? "#5F7A8C" : "var(--text)",
                  }}
                />
              </div>
              {pollOptions.length > 2 && (
                <button
                  onClick={() => handleRemoveOption(index)}
                  className="mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition hover:bg-red-50"
                  style={{ color: "#E74C3C" }}
                  title="删除选项"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          {pollOptions.length < 10 && (
            <button
              onClick={handleAddOption}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 text-sm font-medium transition hover:bg-black/5"
              style={{
                borderColor: isCuteMoe ? "rgba(212,184,184,0.5)" : "var(--card-border)",
                color: isCuteMoe ? "#8BA8B8" : "var(--text-soft)",
              }}
            >
              <Plus className="h-4 w-4" />
              添加选项
            </button>
          )}

          <button
            onClick={handleSendPoll}
            disabled={!canSend}
            className="w-full rounded-xl py-3 font-medium transition disabled:opacity-40"
            style={{
              background: isCuteMoe ? "#E88B8B" : "var(--accent)",
              color: "var(--card)",
              boxShadow: isCuteMoe
                ? "0 4px 12px rgba(232, 139, 139, 0.25)"
                : "0 2px 8px rgba(199, 62, 58, 0.2)",
            }}
          >
            发起投票
          </button>
        </div>
      </div>
    </div>
  );
}
