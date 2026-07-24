import { RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/app";

export default function ViewToggle() {
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const toggleView = useAppStore((s) => s.toggleView);
  const beauty = useAppStore((s) => s.beauty);

  const conv = conversations.find((c) => c.id === activeConversationId);

  if (!conv || conv.type !== "private") return null;

  const isHer = conv.view === "her";
  const herLabel = beauty.herName?.charAt(0) || "他";

  return (
    <button
      onClick={() => toggleView(conv.id)}
      className="group relative flex items-center gap-3 rounded-full border px-2 py-1.5 shadow-card backdrop-blur transition"
      style={{
        borderColor: "var(--card-border)",
        background: "color-mix(in srgb, var(--card) 90%, transparent)",
        color: "var(--text)",
      }}
      aria-label="切换视角"
    >
      <span
        className="absolute top-1/2 h-9 w-9 -translate-y-1/2 rounded-full transition-all duration-500"
        style={{
          background: "var(--accent)",
          left: isHer ? "3.25rem" : "0.25rem",
          boxShadow: "0 2px 0 rgba(0,0,0,0.15)",
        }}
      />
      <span
        className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full font-stamp text-xs transition`}
        style={{ color: !isHer ? "var(--card)" : "color-mix(in srgb, var(--text) 50%, transparent)" }}
      >
        我
      </span>
      <span
        className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full font-stamp text-xs transition`}
        style={{ color: isHer ? "var(--card)" : "color-mix(in srgb, var(--text) 50%, transparent)" }}
      >
        {herLabel}
      </span>
      <span className="ml-1 mr-2 hidden items-center gap-1 text-[11px] sm:flex" style={{ color: "color-mix(in srgb, var(--text) 60%, transparent)" }}>
        <RefreshCw className="h-3 w-3" />
        切换视角
      </span>
    </button>
  );
}
