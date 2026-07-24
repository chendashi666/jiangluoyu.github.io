import { useState } from "react";
import { useAppStore } from "@/store/app";

export default function ChatSettingPanel() {
  const chat = useAppStore((s) => s.chat);
  const setChat = useAppStore((s) => s.setChat);
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const clearMessages = useAppStore((s) => s.clearMessages);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <Section title="回复速度">
        <div className="mb-2 text-[11px]" style={{ color: "var(--text-soft)" }}>
          他回复你的时间范围：{chat.replySpeedMin}s ~ {chat.replySpeedMax}s
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px]" style={{ color: "var(--text-soft)" }}>
            最快 {chat.replySpeedMin}s
          </span>
          <input
            type="range"
            min={3}
            max={300}
            value={chat.replySpeedMin}
            onChange={(e) => {
              const v = Number(e.target.value);
              setChat({ replySpeedMin: v, replySpeedMax: Math.max(v, chat.replySpeedMax) });
            }}
            className="flex-1 accent-[var(--accent)]"
          />
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-[11px]" style={{ color: "var(--text-soft)" }}>
            最慢 {chat.replySpeedMax}s
          </span>
          <input
            type="range"
            min={3}
            max={300}
            value={chat.replySpeedMax}
            onChange={(e) => {
              const v = Number(e.target.value);
              setChat({ replySpeedMax: v, replySpeedMin: Math.min(v, chat.replySpeedMin) });
            }}
            className="flex-1 accent-[var(--accent)]"
          />
        </div>
        <div className="mt-2 flex gap-1">
          {[
            { label: "快速", min: 3, max: 8 },
            { label: "正常", min: 8, max: 20 },
            { label: "慢", min: 30, max: 90 },
            { label: "很慢", min: 120, max: 300 },
          ].map((p) => (
            <button
              key={p.label}
              onClick={() => setChat({ replySpeedMin: p.min, replySpeedMax: p.max })}
              className="flex-1 rounded-lg border py-1 text-[11px] transition hover:bg-black/5"
              style={{
                borderColor: "var(--card-border)",
                color: "var(--text)",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="主动发消息">
        <Toggle
          label="开启后他会主动发消息给你"
          checked={chat.autoMessage}
          onChange={(v) => setChat({ autoMessage: v })}
        />
        {chat.autoMessage && (
          <div className="mt-3">
            <div className="mb-2 text-[11px]" style={{ color: "var(--text-soft)" }}>
              主动发消息间隔：{chat.autoIntervalMin} ~ {chat.autoIntervalMax} 分钟
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] w-8" style={{ color: "var(--text-soft)" }}>
                最小
              </span>
              <input
                type="range"
                min={1}
                max={60}
                value={chat.autoIntervalMin}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setChat({
                    autoIntervalMin: v,
                    autoIntervalMax: Math.max(v, chat.autoIntervalMax),
                  });
                }}
                className="flex-1 accent-[var(--accent)]"
              />
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-[10px] w-8" style={{ color: "var(--text-soft)" }}>
                最大
              </span>
              <input
                type="range"
                min={1}
                max={120}
                value={chat.autoIntervalMax}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setChat({
                    autoIntervalMax: v,
                    autoIntervalMin: Math.min(v, chat.autoIntervalMin),
                  });
                }}
                className="flex-1 accent-[var(--accent)]"
              />
            </div>
          </div>
        )}
      </Section>

      <Section title="喝水提醒">
        <Toggle
          label="6% 概率随机提醒你喝水"
          checked={chat.waterReminder}
          onChange={(v) => setChat({ waterReminder: v })}
        />
      </Section>

      <Section title="后台推送提醒">
        <Toggle
          label="网页在后台时，对方回复消息、发信或回复备忘录，用浏览器推送通知提醒你上线看看"
          checked={chat.pushNotification}
          onChange={(v) => setChat({ pushNotification: v })}
        />
      </Section>

      <Section title="聊天记录">
        <div className="mb-2 text-[11px]" style={{ color: "var(--text-soft)" }}>
          清除当前会话的所有聊天消息，其他数据不受影响。
        </div>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="w-full rounded-lg border py-2.5 text-xs font-medium transition hover:bg-red-50"
          style={{
            borderColor: "rgba(231, 76, 60, 0.3)",
            color: "#E74C3C",
            background: "var(--card)",
          }}
        >
          清除聊天记录
        </button>
      </Section>

      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="w-[80%] max-w-sm rounded-2xl border p-5"
            style={{
              borderColor: "var(--card-border)",
              background: "var(--card)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 text-center font-serif text-base font-bold" style={{ color: "var(--text)" }}>
              确认清除聊天记录？
            </div>
            <div className="mb-4 text-center text-xs" style={{ color: "var(--text-soft)" }}>
              此操作将删除当前会话的所有消息，且不可恢复。其他数据（联系人、字卡、设置等）不受影响。
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded-xl py-2.5 text-sm transition hover:bg-black/5"
                style={{ background: "var(--bg)", color: "var(--text)" }}
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (activeConversationId) {
                    clearMessages(activeConversationId);
                  }
                  setShowClearConfirm(false);
                }}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                style={{ background: "#E74C3C" }}
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 font-serif text-sm font-bold" style={{ color: "var(--text)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition hover:bg-black/5"
      style={{
        background: "var(--card)",
        borderColor: "var(--card-border)",
        color: "var(--text)",
      }}
    >
      <span className="text-xs">{label}</span>
      <span
        className="relative h-5 w-9 rounded-full transition"
        style={{ background: checked ? "var(--accent)" : "color-mix(in srgb, var(--text) 20%, transparent)" }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
          style={{ left: checked ? "18px" : "2px" }}
        />
      </span>
    </button>
  );
}
