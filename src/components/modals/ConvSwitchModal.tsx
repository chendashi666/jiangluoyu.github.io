import React, { useState } from "react";
import { X, UserPlus, Users, MessageCircle, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/app";

interface ConvSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConvSwitchModal({ isOpen, onClose }: ConvSwitchModalProps) {
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const groupConversationId = useAppStore((s) => s.groupConversationId);
  const contacts = useAppStore((s) => s.contacts);
  const setActiveConversation = useAppStore((s) => s.setActiveConversation);
  const addContact = useAppStore((s) => s.addContact);
  const addToGroup = useAppStore((s) => s.addToGroup);
  const addPrivateConversation = useAppStore((s) => s.addPrivateConversation);
  const deleteContact = useAppStore((s) => s.deleteContact);

  const [newContactName, setNewContactName] = useState("");

  const groupConv = conversations.find((c) => c.id === groupConversationId);
  const privateConvs = conversations.filter((c) => c.type === "private");

  const getContactById = (id: string) => contacts.find((c) => c.id === id);

  const handleAddContact = () => {
    const name = newContactName.trim();
    if (!name) return;
    const contactId = addContact(name);
    addToGroup(contactId);
    addPrivateConversation(contactId);
    setNewContactName("");
  };

  const handleSelectConv = (convId: string) => {
    setActiveConversation(convId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-[90%] max-w-md max-h-[85vh] flex flex-col animate-popIn rounded-2xl border p-4 shadow-2xl"
        style={{
          borderColor: "var(--card-border)",
          background: "var(--card)",
        }}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
            切换会话
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/10"
            style={{ color: "var(--text-soft)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto fancy-scroll space-y-2">
          <button
            onClick={() => handleSelectConv(groupConversationId)}
            className={`flex w-full items-center gap-3 rounded-xl border p-3 transition hover:bg-black/5 ${
              activeConversationId === groupConversationId ? "bg-black/5" : ""
            }`}
            style={{
              borderColor: activeConversationId === groupConversationId ? "var(--accent)" : "var(--card-border)",
            }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: "var(--accent)", color: "var(--card)" }}
            >
              <Users className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium" style={{ color: "var(--text)" }}>
                {groupConv?.name || "群聊"}
              </div>
              <div className="text-xs" style={{ color: "var(--text-soft)" }}>
                {groupConv?.memberIds.length || 0} 人
              </div>
            </div>
            {activeConversationId === groupConversationId && (
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--accent)" }} />
            )}
          </button>

          {privateConvs.map((conv) => {
            const contact = getContactById(conv.memberIds[0]);
            const contactId = conv.memberIds[0];
            return (
              <div
                key={conv.id}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 transition hover:bg-black/5 ${
                  activeConversationId === conv.id ? "bg-black/5" : ""
                }`}
                style={{
                  borderColor: activeConversationId === conv.id ? "var(--accent)" : "var(--card-border)",
                }}
              >
                <button
                  onClick={() => handleSelectConv(conv.id)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: "var(--her-card)", color: "var(--text)" }}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ color: "var(--text)" }}>
                      {conv.name}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-soft)" }}>
                      私聊 · {contact?.avatar || "他"}
                    </div>
                  </div>
                  {activeConversationId === conv.id && (
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: "var(--accent)" }} />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`确定删除和「${conv.name}」的私聊会话吗？`)) {
                      deleteContact(contactId);
                    }
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-red-100 hover:text-red-500"
                  style={{ color: "var(--text-soft)" }}
                  title="删除会话"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 shrink-0 border-t pt-4" style={{ borderColor: "var(--card-border)" }}>
          <div className="mb-2 flex items-center gap-2">
            <UserPlus className="h-4 w-4" style={{ color: "var(--text-soft)" }} />
            <span className="text-sm" style={{ color: "var(--text-soft)" }}>
              添加联系人
            </span>
          </div>
          <div className="flex gap-2">
            <input
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddContact();
              }}
              placeholder="输入名字..."
              className="flex-1 rounded-xl border px-4 py-2.5 text-sm focus:outline-none"
              style={{
                borderColor: "var(--card-border)",
                background: "var(--bg)",
                color: "var(--text)",
              }}
            />
            <button
              onClick={handleAddContact}
              disabled={!newContactName.trim()}
              className="rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-40"
              style={{
                background: "var(--accent)",
                color: "var(--card)",
              }}
            >
              添加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}