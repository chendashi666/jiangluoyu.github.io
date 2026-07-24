import React, { useState } from "react";
import { X, Circle, Hand, Scissors } from "lucide-react";
import { useAppStore } from "@/store/app";

interface RPSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RPSModal({ isOpen, onClose }: RPSModalProps) {
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const contacts = useAppStore((s) => s.contacts);
  const sendRPS = useAppStore((s) => s.sendRPS);

  const [rpsTargetId, setRpsTargetId] = useState("");

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const getContactById = (id: string) => contacts.find((c) => c.id === id);

  const handleSendRPS = (choice: "rock" | "paper" | "scissors") => {
    if (!rpsTargetId || !activeConv) return;
    sendRPS(activeConv.id, rpsTargetId, choice);
    setRpsTargetId("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-[90%] max-w-sm animate-popIn rounded-2xl border p-4 shadow-2xl"
        style={{
          borderColor: "var(--card-border)",
          background: "var(--card)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
            猜拳挑战
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/10"
            style={{ color: "var(--text-soft)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm" style={{ color: "var(--text-soft)" }}>
            选择对手
          </label>
          <div className="grid grid-cols-3 gap-2">
            {activeConv?.memberIds.map((mid) => {
              const contact = getContactById(mid);
              return (
                <button
                  key={mid}
                  onClick={() => setRpsTargetId(mid)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition ${
                    rpsTargetId === mid ? "border-[var(--accent)] bg-black/5" : ""
                  }`}
                  style={{
                    borderColor: rpsTargetId === mid ? "var(--accent)" : "var(--card-border)",
                  }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: "var(--her-card)", color: "var(--text)" }}
                  >
                    {contact?.avatar || "?"}
                  </div>
                  <span className="text-xs font-medium" style={{ color: "var(--text)" }}>
                    {contact?.name || "未知"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm" style={{ color: "var(--text-soft)" }}>
            选择出拳
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSendRPS("rock")}
              disabled={!rpsTargetId}
              className="flex flex-col items-center gap-2 rounded-xl border p-4 transition hover:bg-black/5 disabled:opacity-40"
              style={{
                borderColor: "var(--card-border)",
                background: "var(--bg)",
              }}
            >
              <Circle className="h-8 w-8" style={{ color: "var(--text)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                石头
              </span>
            </button>
            <button
              onClick={() => handleSendRPS("paper")}
              disabled={!rpsTargetId}
              className="flex flex-col items-center gap-2 rounded-xl border p-4 transition hover:bg-black/5 disabled:opacity-40"
              style={{
                borderColor: "var(--card-border)",
                background: "var(--bg)",
              }}
            >
              <Hand className="h-8 w-8" style={{ color: "var(--text)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                布
              </span>
            </button>
            <button
              onClick={() => handleSendRPS("scissors")}
              disabled={!rpsTargetId}
              className="flex flex-col items-center gap-2 rounded-xl border p-4 transition hover:bg-black/5 disabled:opacity-40"
              style={{
                borderColor: "var(--card-border)",
                background: "var(--bg)",
              }}
            >
              <Scissors className="h-8 w-8" style={{ color: "var(--text)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                剪刀
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}